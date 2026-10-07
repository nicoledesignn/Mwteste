# MW FITNESS — landing page

Site estático (HTML/CSS/JS puro) para GitHub Pages.

## Antes de publicar
O WhatsApp (11 94792-7762) já está configurado em `script.js` (`WHATSAPP_NUMBER`).
1. **Google Maps (opcional)**: em `script.js`, preencha `MAPS_URL` com o link exato do local. Se vazio, o botão abre a busca pelo endereço.
2. **Imagem de compartilhamento**: em `index.html`, troque `og.jpg` pela URL absoluta depois de publicar (ex.: `https://usuario.github.io/repo/og.jpg`).

## Trocar/adicionar mídia
Coloque os arquivos em `assets/NN/` e rode `python3 build_manifest.py` — ele regenera o `manifest.js`
(ordem = ordem dos nomes dos arquivos; imagens e vídeos são identificados pela extensão).

## Mapa das pastas (identificado a partir do conteúdo)
01 logo · 02 retratos (carrossel) · 03 vídeo do hero · 04 vídeo de ambiente · 05 fotos de treino (carrossel)
06 horários · 07 endereço · 08 foto de destaque (marca) · 09 foto editorial
