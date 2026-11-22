import { ADMIN_MESSAGE_SOURCE, EDITOR_MESSAGE_SOURCE, initEditorBridge, isEditorFrame } from './editor-bridge';

function fakeWindow(search: string, embedded: boolean) {
  const posted: unknown[] = [];
  const listeners: Record<string, (e: unknown) => void> = {};
  const win = {
    location: { search, origin: 'http://localhost' },
    parent: embedded ? { postMessage: (m: unknown) => posted.push(m) } : undefined,
    addEventListener: (type: string, fn: (e: unknown) => void) => (listeners[type] = fn),
    removeEventListener: () => undefined,
  } as unknown as Window;
  if (!embedded) (win as unknown as { parent: Window }).parent = win;
  return { win, posted, listeners };
}

describe('editor bridge', () => {
  afterEach(() => {
    document.body.className = '';
    document.body.innerHTML = '';
  });

  it('stays off outside an editor iframe', () => {
    expect(isEditorFrame(fakeWindow('?editor=1', false).win)).toBe(false);
    expect(isEditorFrame(fakeWindow('', true).win)).toBe(false);
    expect(initEditorBridge(document, fakeWindow('', false).win)).toBeNull();
  });

  it('reports the clicked block and focuses the one the admin asks for', () => {
    document.body.innerHTML = '<section id="inicio"><a id="x">Hola</a></section><section id="proceso"></section>';
    const { win, posted, listeners } = fakeWindow('?editor=1', true);
    const stop = initEditorBridge(document, win);

    expect(document.body.classList.contains('editor-mode')).toBe(true);
    expect(posted).toContainEqual({ source: EDITOR_MESSAGE_SOURCE, type: 'ready' });

    document.getElementById('x')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(posted).toContainEqual({ source: EDITOR_MESSAGE_SOURCE, type: 'select', block: 'inicio' });

    document.getElementById('proceso')!.scrollIntoView = () => undefined;
    listeners['message']({ origin: 'http://localhost', data: { source: ADMIN_MESSAGE_SOURCE, type: 'focus', block: 'proceso' } });
    expect(document.getElementById('proceso')!.classList.contains('editor-selected')).toBe(true);

    stop?.();
    expect(document.body.classList.contains('editor-mode')).toBe(false);
  });

  it('ignores messages from another origin', () => {
    document.body.innerHTML = '<section id="inicio"></section>';
    const { win, listeners } = fakeWindow('?editor=1', true);
    initEditorBridge(document, win);
    listeners['message']({ origin: 'https://evil.example', data: { source: ADMIN_MESSAGE_SOURCE, type: 'focus', block: 'inicio' } });
    expect(document.getElementById('inicio')!.classList.contains('editor-selected')).toBe(false);
  });

  it('re-applies the mark when the block is replaced (skeleton → real content)', async () => {
    document.body.innerHTML = '<main><section id="servicios"></section></main>';
    const { win, listeners } = fakeWindow('?editor=1', true);
    Element.prototype.scrollIntoView = () => undefined;
    initEditorBridge(document, win);
    listeners['message']({ origin: 'http://localhost', data: { source: ADMIN_MESSAGE_SOURCE, type: 'focus', block: 'servicios' } });

    document.body.innerHTML = '<main><section id="servicios"></section></main>';
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(document.getElementById('servicios')!.classList.contains('editor-selected')).toBe(true);
  });

  it('reports the clicked field and shows a live draft without touching anything else', () => {
    document.body.innerHTML =
      '<section id="inicio"><h1 data-edit-field="titulo">Hola</h1><p data-edit-field="etiqueta"><span></span>Etiqueta</p></section>';
    const { win, posted, listeners } = fakeWindow('?editor=1', true);
    initEditorBridge(document, win);

    document.querySelector('h1')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(posted).toContainEqual({ source: EDITOR_MESSAGE_SOURCE, type: 'select', block: 'inicio', field: 'titulo' });

    const send = (values: Record<string, unknown> | null) =>
      listeners['message']({ origin: 'http://localhost', data: { source: ADMIN_MESSAGE_SOURCE, type: 'draft', block: 'inicio', values } });
    send({ titulo: 'Nuevo\ntítulo', etiqueta: 'Otra', ignorado: 5 });
    expect(document.querySelector('h1')!.textContent).toBe('Nuevo\ntítulo');
    // Solo cambia el último texto: el punto (span) de la etiqueta se conserva.
    expect(document.querySelector('p')!.querySelector('span')).toBeTruthy();
    expect(document.querySelector('p')!.textContent).toBe('Otra');

    send(null);
    expect(document.querySelector('h1')!.textContent).toBe('Hola');
    expect(document.querySelector('p')!.textContent).toBe('Etiqueta');
  });

  it('never injects markup from a draft', () => {
    document.body.innerHTML = '<section id="inicio"><h1 data-edit-field="titulo">Hola</h1></section>';
    const { win, listeners } = fakeWindow('?editor=1', true);
    initEditorBridge(document, win);
    listeners['message']({
      origin: 'http://localhost',
      data: { source: ADMIN_MESSAGE_SOURCE, type: 'draft', block: 'inicio', values: { titulo: '<img src=x onerror=alert(1)>' } },
    });
    expect(document.querySelector('h1 img')).toBeNull();
    expect(document.querySelector('h1')!.textContent).toBe('<img src=x onerror=alert(1)>');
  });

  it('falls back to the section field when an area without its own field is tapped', () => {
    document.body.innerHTML =
      '<section id="inicio" data-edit-fallback="fotos"><div id="capa"><h1 data-edit-field="titulo">Hola</h1></div></section><section id="proceso"><p id="x">Sin campo</p></section>';
    const { win, posted } = fakeWindow('?editor=1', true);
    initEditorBridge(document, win);
    const click = (id: string) =>
      document.getElementById(id)!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    click('capa');
    expect(posted).toContainEqual({ source: EDITOR_MESSAGE_SOURCE, type: 'select', block: 'inicio', field: 'fotos' });
    click('x');
    expect(posted).toContainEqual({ source: EDITOR_MESSAGE_SOURCE, type: 'select', block: 'proceso', field: undefined });
  });

  it('reports the tapped item and applies a draft only inside that item', () => {
    document.body.innerHTML =
      '<section id="servicios"><h2 data-edit-field="titulo">Título</h2>' +
      '<ul><li id="a" data-edit-item="servicio:a" data-edit-fallback="nombre"><h3 data-edit-field="nombre">Uno</h3></li>' +
      '<li data-edit-item="servicio:b" data-edit-fallback="nombre"><h3 data-edit-field="nombre">Dos</h3></li></ul></section>';
    const { win, posted, listeners } = fakeWindow('?editor=1', true);
    initEditorBridge(document, win);

    document.getElementById('a')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(posted).toContainEqual({
      source: EDITOR_MESSAGE_SOURCE, type: 'select', block: 'servicios', field: 'nombre', item: 'servicio:a',
    });

    const send = (item: string | null, values: Record<string, unknown> | null) =>
      listeners['message']({ origin: 'http://localhost', data: { source: ADMIN_MESSAGE_SOURCE, type: 'draft', block: 'servicios', item, values } });
    send('servicio:b', { nombre: 'Dos editado' });
    const names = () => Array.from(document.querySelectorAll('h3')).map((h) => h.textContent);
    expect(names()).toEqual(['Uno', 'Dos editado']);

    // Un borrador del bloque no toca los campos de las tarjetas.
    send(null, { titulo: 'Nuevo título', nombre: 'No debe cambiar' });
    expect(names()).toEqual(['Uno', 'Dos']);
    expect(document.querySelector('h2')!.textContent).toBe('Nuevo título');

    send(null, null);
    expect(document.querySelector('h2')!.textContent).toBe('Título');
  });

  it('keeps the texts inside links clickable one by one (no pointer-events:none on links)', () => {
    document.body.innerHTML = '<section id="s"></section>';
    const { win } = fakeWindow('?editor=1', true);
    initEditorBridge(document, win);
    const css = Array.from(document.head.querySelectorAll('style')).map((st) => st.textContent).join('');
    expect(css).not.toContain('pointer-events:none');
  });
});
