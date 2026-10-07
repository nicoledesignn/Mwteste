#!/usr/bin/env python3
"""Gera manifest.js a partir do conteúdo real de assets/NN/.
Rode novamente sempre que adicionar/trocar arquivos:  python3 build_manifest.py
Ordem = ordem numérica/alfabética dos nomes dentro de cada pasta."""
import os, re, json
ROOT=os.path.dirname(os.path.abspath(__file__)); A=os.path.join(ROOT,'assets')
IMG=('.webp','.jpg','.jpeg','.png','.avif'); VID=('.mp4','.webm','.mov')
m={}
for d in sorted(os.listdir(A)):
    p=os.path.join(A,d)
    if not (os.path.isdir(p) and re.fullmatch(r'\d\d',d)): continue
    items=[]
    for f in sorted(os.listdir(p)):
        stem,ext=os.path.splitext(f); ext=ext.lower()
        if re.search(r'(-640|-poster)$',stem) or stem.startswith('logo'): continue
        rel=f'assets/{d}/{f}'
        if ext in VID:
            poster=f'assets/{d}/{stem}-poster.webp'
            items.append({'type':'video','src':rel,**({'poster':poster} if os.path.exists(os.path.join(ROOT,poster)) else {})})
        elif ext in IMG:
            th=f'assets/{d}/{stem}-640.webp'
            items.append({'type':'image','src':rel,**({'thumb':th} if os.path.exists(os.path.join(ROOT,th)) else {})})
    m[d]=items
open(os.path.join(ROOT,'manifest.js'),'w').write('/* Gerado por build_manifest.py — não editar à mão */\nwindow.MW_MANIFEST = '+json.dumps(m,indent=2,ensure_ascii=False)+';\n')
print(json.dumps(m,indent=1))
