#!/usr/bin/env python3
"""Genera (FLUX, skill generar-imagen) y sube a Cloudinary las imagenes DEMO de ISANORTE Cajamarca.
Reanudable: omite lo ya generado/subido. Escribe manifiesto.json (clave -> secure_url).
Credenciales: entorno (CLOUDFLARE_*) y .env del backend (CLOUDINARY_*), nunca se imprimen.
Uso: python3 imagenes.py [--solo-generar] [--solo-subir]"""
import hashlib, json, os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import requests
from PIL import Image

BASE = Path(__file__).parent
OUT = BASE / "imagenes"; OUT.mkdir(exist_ok=True)
MANIFEST = BASE / "manifiesto.json"
SKILL = Path.home() / ".claude/skills/generar-imagen/generar_imagen.py"
ROOT = "isanorte-cajamarca"
STYLE = "professional architectural photography, natural soft light, high detail, no text, no watermark"
NOFACE = ", no people faces"
WIDE, CARD, SQ = (1600, 900), (1200, 900), (900, 900)
AND = "Andean highlands of Cajamarca Peru, green hills, eucalyptus trees, red clay roof tiles, whitewashed walls"

SPEC = []
def add(key, folder, size, prompt, face=False):
    SPEC.append((key, f"{ROOT}/{folder}", size, f"{prompt}, {STYLE}" + ("" if face else NOFACE)))

for k, p in [
    ("hero-casa", f"modern country house with red tile roof and stone base at golden hour, {AND}"),
    ("hero-sala", "warm modern living room with exposed wood beams, large windows toward green mountains, neutral tones"),
    ("hero-obra", f"construction site of a two storey concrete house with scaffolding at sunrise, {AND}"),
    ("hero-planos", "architect hands marking a house blueprint on a wooden table at a building site, hard hats and tape measure"),
    ("hero-edificio", f"modern four storey residential building under construction in a small Andean city, {AND}"),
]: add(k, "hero", WIDE, p)

for k, p in [
    ("servicio-planos", "architect desk with house blueprints, scale model and laptop showing 3d house design"),
    ("servicio-ejecucion", f"engineer supervising reinforced concrete structure on a building site, {AND}"),
    ("servicio-topografia", f"total station surveying instrument on a tripod over a green Andean hillside, {AND}"),
    ("servicio-saneamiento", "property documents, land plot map, stamp and ruler on a desk, legal land registration"),
    ("servicio-habilitaciones", f"aerial view of new urban lots with paved roads and curbs on a hillside, {AND}"),
    ("servicio-remodelaciones", "home renovation in progress, new flooring being laid and freshly painted walls, bright room"),
    ("servicio-interiores", "interior design scene with fabric swatches, wood and stone samples and plants on a table"),
    ("servicio-estructuras-metalicas", "steel frame structure of an industrial warehouse being welded, blue sky"),
]: add(k, "servicios", CARD, p)

PROY = [
    ("casa-campestre-banos-del-inca", f"contemporary country house with stone and wood facade, red clay tile roof, garden, {AND}"),
    ("edificio-multifamiliar-amazonas", "modern four storey apartment building facade with balconies in a small Andean city, afternoon light"),
    ("remodelacion-casona-plaza-de-armas", "restored colonial style house facade with wooden balconies, whitewashed walls and red tile roof in Cajamarca"),
    ("habilitacion-urbana-mirador-del-cumbe", f"new residential urban development with paved streets and lots on a hillside, {AND}"),
    ("galpon-agroindustrial-namora", "large steel structure agro industrial warehouse with metal roof, rural valley, clear sky"),
    ("local-comercial-av-atahualpa", "modern two storey commercial building with glass storefront and signage area left blank, street view"),
]
for k, p in PROY: add("proyecto-" + k, "proyectos", CARD, p)

for k, p in [
    ("casa-campestre-antes", f"empty sloped plot of land with grass and eucalyptus, stakes and string marking foundations, {AND}"),
    ("casa-campestre-proceso", f"house under construction with brick walls and reinforced columns, scaffolding, {AND}"),
    ("casa-campestre-final", "warm interior of a finished country house, wood ceiling, stone fireplace, large window to the hills"),
    ("casona-antes", "deteriorated old colonial house facade with peeling paint and cracked walls"),
    ("casona-proceso", "colonial house renovation scaffolding, workers' tools, new wooden balcony being installed"),
    ("casona-final", "restored colonial house courtyard with stone floor, wooden columns and plants"),
    ("galpon-proceso", "steel columns and trusses being assembled for a warehouse, crane, blue sky"),
]: add("galeria-" + k, "galeria", CARD, p)

for k, p in [
    ("equipo-gerente", "professional headshot portrait of a Peruvian man in his 50s, civil engineer, wearing a white hard hat and polo shirt, neutral background"),
    ("equipo-arquitecta", "professional headshot portrait of a Peruvian woman in her 30s, architect, smiling, dark hair, office background"),
    ("equipo-supervisor", "professional headshot portrait of a Peruvian man in his 40s, site supervisor, reflective vest and helmet, construction site background"),
    ("equipo-topografo", "professional headshot portrait of a Peruvian man in his 30s, surveyor, outdoor hillside background"),
]: add(k, "equipo", SQ, p, face=True)

add("isadecor-fondo", "isadecor", WIDE, "dark moody interior wall covered with elegant wood slat paneling, accent lighting")
for k, p in [("isadecor-1", "close up of walnut wood wall panels with soft grazing light"),
             ("isadecor-2", "marble look wall cladding in a luxury lobby"),
             ("isadecor-3", "oak herringbone flooring in a bright living room")]:
    add(k, "isadecor", CARD, p)
add("nosotros-imagen", "paginas", CARD, f"team of construction professionals reviewing plans on site seen from behind, {AND}")
add("nosotros-fondo", "paginas", WIDE, f"wide landscape of the Cajamarca valley with a house under construction, {AND}")
add("cta-fondo", "paginas", CARD, "consultant showing house plans to a couple in a bright office, seen from behind")

def cargar_env():
    env = BASE.parent / "ISANORTE-Backend/.env"
    for l in env.read_text().splitlines():
        l = l.strip()
        if "=" in l and not l.startswith("#"):
            k, v = l.split("=", 1)
            if k.strip() in ("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET") and not os.environ.get(k.strip()):
                os.environ[k.strip()] = v.strip().strip('"').strip("'")

def generar(item):
    key, folder, size, prompt = item
    dst = OUT / f"{key}.jpg"
    if dst.exists(): return key, True
    tmp = OUT / f"{key}.raw.jpg"
    for intento in range(3):
        r = subprocess.run([sys.executable, str(SKILL), prompt, "-o", str(tmp), "--steps", "6"], capture_output=True, text=True, timeout=240)
        if tmp.exists(): break
        time.sleep(3)
    if not tmp.exists():
        print("FALLO", key, r.stderr[-200:], flush=True); return key, False
    im = Image.open(tmp).convert("RGB")
    w, h = size
    ratio = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * ratio), round(im.height * ratio)))
    l, t = (im.width - w) // 2, (im.height - h) // 2
    im.crop((l, t, l + w, t + h)).save(dst, quality=82, optimize=True)
    tmp.unlink()
    print("ok", key, flush=True)
    return key, True

def subir(path, folder, key, resource="image"):
    cloud, api_key, secret = (os.environ[k] for k in ("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"))
    ts = str(int(time.time()))
    params = {"folder": folder, "overwrite": "true", "public_id": key, "timestamp": ts}
    sig = hashlib.sha1(("&".join(f"{k}={params[k]}" for k in sorted(params)) + secret).encode()).hexdigest()
    params.update(signature=sig, api_key=api_key)
    with open(path, "rb") as fh:
        r = requests.post(f"https://api.cloudinary.com/v1_1/{cloud}/{resource}/upload", data=params, files={"file": fh}, timeout=300)
    r.raise_for_status()
    return r.json()["secure_url"]

def main():
    cargar_env()
    if "--solo-subir" not in sys.argv:
        with ThreadPoolExecutor(4) as ex:
            res = list(ex.map(generar, SPEC))
        print("generadas", sum(1 for _, ok in res if ok), "de", len(SPEC), flush=True)
    if "--solo-generar" in sys.argv: return
    man = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    jobs = [(OUT / f"{k}.jpg", f, k, "image") for k, f, _, _ in SPEC if (OUT / f"{k}.jpg").exists() and k not in man]
    def up(j):
        p, f, k, r = j
        man[k] = subir(p, f, k, r); print("subida", k, flush=True)
    with ThreadPoolExecutor(4) as ex: list(ex.map(up, jobs))
    MANIFEST.write_text(json.dumps(dict(sorted(man.items())), indent=1))
    print("manifiesto:", len(man))

main()
