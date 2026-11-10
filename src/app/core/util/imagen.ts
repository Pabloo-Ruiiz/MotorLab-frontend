const LADO_PX = 256;
const CALIDAD_JPEG = 0.85;

// Recorta el centro y reduce la imagen: unos 30 kB que caben sin problema en localStorage
export function recortarCuadrado(fuente: CanvasImageSource, ancho: number, alto: number): string {
  const lienzo = document.createElement('canvas');
  lienzo.width = LADO_PX;
  lienzo.height = LADO_PX;

  const contexto = lienzo.getContext('2d');
  if (contexto === null) {
    throw new Error('El navegador no permite procesar imágenes');
  }

  const lado = Math.min(ancho, alto);

  // JPEG no admite transparencia: sin este fondo, las zonas transparentes saldrían negras
  contexto.fillStyle = '#ffffff';
  contexto.fillRect(0, 0, LADO_PX, LADO_PX);
  contexto.drawImage(
    fuente,
    (ancho - lado) / 2,
    (alto - lado) / 2,
    lado,
    lado,
    0,
    0,
    LADO_PX,
    LADO_PX,
  );

  return lienzo.toDataURL('image/jpeg', CALIDAD_JPEG);
}

export async function archivoACuadrado(archivo: Blob): Promise<string> {
  const imagen = await createImageBitmap(archivo);

  try {
    return recortarCuadrado(imagen, imagen.width, imagen.height);
  } finally {
    imagen.close();
  }
}
