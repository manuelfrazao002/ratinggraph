// src/imgs/covers/imagesLoader.js

// Importa todos os arquivos .png do diretório atual, carregando-os imediatamente (eager)
const images = import.meta.glob('./*.png', { eager: true });

const imageMap = {};

// Para cada caminho retornado, cria uma chave no objeto imageMap
for (const path in images) {
  // Remove './' e '.png' do nome do arquivo e deixa tudo em minúsculas
  const key = path
    .replace('./', '')      // ex: './MinhaImagem.png' -> 'MinhaImagem.png'
    .replace('.png', '')    // 'MinhaImagem.png' -> 'MinhaImagem'
    .toLowerCase();         // 'MinhaImagem' -> 'minhaimagem'

  // Atribui a URL da imagem (propriedade default do módulo importado) para essa chave
  imageMap[key] = images[path].default;
}

// Exporta o objeto contendo nome: url
export default imageMap;
