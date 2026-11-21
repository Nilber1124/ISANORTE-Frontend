/**
 * Puente de edición: cuando una página pública se abre dentro de la vista previa del admin
 * (iframe del mismo origen con `?editor=1`), marca los bloques editables y avisa al admin
 * cuál se tocó. Fuera de ese caso no hace nada.
 *
 * Mensajes (siempre del mismo origen):
 *  - página → admin: `{ source: 'isanorte-editor', type: 'select' | 'ready', block?, field? }`
 *    (`field` es el `data-edit-field` del texto o imagen tocado, si lo hay)
 *  - admin → página: `{ source: 'isanorte-admin', type: 'focus', block }` y
 *    `{ source: 'isanorte-admin', type: 'draft', block, values }` (`values: null` restaura lo guardado):
 *    muestra al instante el texto que se está escribiendo, sin guardar nada.
 */
export const EDITOR_MESSAGE_SOURCE = 'isanorte-editor';
export const ADMIN_MESSAGE_SOURCE = 'isanorte-admin';

const EDITOR_STYLE = `
body.editor-mode section[id]{cursor:pointer;transition:outline-color .15s}
body.editor-mode [data-edit-field]{cursor:text}
body.editor-mode [data-edit-field]:hover{outline:2px solid #f97316;outline-offset:3px}
body.editor-mode section[id]:hover{outline:2px dashed #f97316;outline-offset:-2px}
body.editor-mode section[id].editor-selected{outline:3px solid #f97316;outline-offset:-3px}
body.editor-mode a,body.editor-mode button{pointer-events:none}
`;

export function isEditorFrame(win: Window): boolean {
  try {
    return win.parent !== win && new URLSearchParams(win.location.search).get('editor') === '1';
  } catch {
    return false;
  }
}

/** Activa el modo editor; devuelve una función que lo desactiva (o `null` si no aplica). */
export function initEditorBridge(doc: Document, win: Window): (() => void) | null {
  if (!isEditorFrame(win)) return null;

  doc.body.classList.add('editor-mode');
  const style = doc.createElement('style');
  style.textContent = EDITOR_STYLE;
  doc.head.appendChild(style);

  const onClick = (event: Event): void => {
    const target = event.target as Element | null;
    const section = target?.closest?.('section[id]');
    if (!section) return;
    event.preventDefault();
    event.stopPropagation();
    const field = target?.closest?.('[data-edit-field]')?.getAttribute('data-edit-field') ?? undefined;
    win.parent.postMessage(
      { source: EDITOR_MESSAGE_SOURCE, type: 'select', block: section.id, field },
      win.location.origin,
    );
  };

  const onMessage = (event: MessageEvent): void => {
    if (event.origin !== win.location.origin) return;
    const data = event.data as {
      source?: string;
      type?: string;
      block?: string;
      values?: Record<string, unknown> | null;
    } | null;
    if (data?.source !== ADMIN_MESSAGE_SOURCE) return;
    if (data.type === 'focus' && data.block) focusBlock(data.block);
    else if (data.type === 'draft') setDraft(data.block ?? '', data.values ?? null);
  };

  // Borrador en vivo: cambia solo el texto mostrado (nunca el HTML) y recuerda el original.
  let draft: { block: string; values: Record<string, string> } | null = null;
  const originals = new Map<Element, string>();
  const lastTextNode = (el: Element): Text => {
    for (let i = el.childNodes.length - 1; i >= 0; i--) {
      if (el.childNodes[i].nodeType === 3) return el.childNodes[i] as Text;
    }
    return el.appendChild(doc.createTextNode(''));
  };
  const applyDraft = (): void => {
    const section = draft ? doc.getElementById(draft.block) : null;
    if (!draft || !section) return;
    section.querySelectorAll('[data-edit-field]').forEach((el) => {
      const key = el.getAttribute('data-edit-field') ?? '';
      if (!(key in draft!.values)) return;
      const node = lastTextNode(el);
      if (!originals.has(el)) originals.set(el, node.data);
      node.data = draft!.values[key];
    });
  };
  const restoreDraft = (): void => {
    originals.forEach((text, el) => {
      if (el.isConnected) lastTextNode(el).data = text;
    });
    originals.clear();
  };
  const setDraft = (block: string, values: Record<string, unknown> | null): void => {
    if (!values) {
      draft = null;
      restoreDraft();
      return;
    }
    const clean: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === 'string') clean[key] = value.slice(0, 2000);
    }
    draft = { block, values: clean };
    applyDraft();
  };

  // El contenido llega de la API después de montar la página y Angular reemplaza el esqueleto de
  // carga por el bloque real (mismo id): la marca se reaplica cada vez que cambia el DOM.
  let current: string | null = null;
  let marked: HTMLElement | null = null;
  const applyFocus = (smooth: boolean): void => {
    const target = current ? doc.getElementById(current) : null;
    if (!target || target === marked) return;
    marked?.classList.remove('editor-selected');
    doc.querySelectorAll('.editor-selected').forEach((el) => el.classList.remove('editor-selected'));
    target.classList.add('editor-selected');
    target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    marked = target;
  };
  const focusBlock = (block: string): void => {
    current = block;
    marked = null;
    applyFocus(true);
  };
  const observer =
    typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver(() => {
          if (current && (!marked || !marked.isConnected)) applyFocus(false);
          if (draft) applyDraft();
        });
  observer?.observe(doc.body, { childList: true, subtree: true });

  doc.addEventListener('click', onClick, true);
  win.addEventListener('message', onMessage);
  win.parent.postMessage({ source: EDITOR_MESSAGE_SOURCE, type: 'ready' }, win.location.origin);

  return () => {
    observer?.disconnect();
    restoreDraft();
    doc.removeEventListener('click', onClick, true);
    win.removeEventListener('message', onMessage);
    doc.body.classList.remove('editor-mode');
    style.remove();
  };
}
