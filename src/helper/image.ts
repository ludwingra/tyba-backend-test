import sharp from 'sharp';

export class Image {

  public getInfoImage(image: Buffer | string) {
    return sharp(image).metadata();
  }

  public resizeImage(image: Buffer, size: number) {
    return sharp(image).resize(size).toBuffer();
  }

  static defineSize(widthActually: number) {
    let size = [1920, 720, 320, 180];
    return size.filter(t => t < widthActually);
  }
}