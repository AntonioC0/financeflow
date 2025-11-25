# Ícones PWA

Esta pasta deve conter os ícones do aplicativo em vários tamanhos para PWA.

## Tamanhos Necessários:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Como Gerar os Ícones:

### Opção 1: Ferramenta Online (Mais Fácil)

1. Acesse: https://www.pwabuilder.com/imageGenerator
2. Faça upload do seu logo (PNG ou SVG)
3. Clique em "Generate"
4. Baixe o ZIP com todos os tamanhos
5. Extraia os arquivos nesta pasta

### Opção 2: Photoshop/GIMP

1. Abra seu logo no editor
2. Redimensione para cada tamanho listado acima
3. Exporte como PNG
4. Salve nesta pasta com os nomes corretos

### Opção 3: Ferramenta de Linha de Comando

Se você tem ImageMagick instalado:

```bash
# A partir de um logo grande (ex: logo-1024.png)
convert logo-1024.png -resize 72x72 icon-72x72.png
convert logo-1024.png -resize 96x96 icon-96x96.png
convert logo-1024.png -resize 128x128 icon-128x128.png
convert logo-1024.png -resize 144x144 icon-144x144.png
convert logo-1024.png -resize 152x152 icon-152x152.png
convert logo-1024.png -resize 192x192.png icon-192x192.png
convert logo-1024.png -resize 384x384 icon-384x384.png
convert logo-1024.png -resize 512x512 icon-512x512.png
```

## Dicas:

- Use imagens quadradas (mesma largura e altura)
- Fundo transparente funciona melhor
- PNG é o formato recomendado
- Resolução mínima: 512x512px para o maior ícone
- Os ícones devem ter boa visibilidade em fundos claros e escuros

## Ícones Temporários:

Por enquanto, você pode usar o logo.png existente até gerar os ícones específicos.
O PWA vai funcionar mesmo sem os ícones, mas a experiência será melhor com eles.
