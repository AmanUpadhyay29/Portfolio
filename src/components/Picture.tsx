type PictureProps = {
  /** File stem under /images, e.g. "aman" -> /images/aman-320.webp */
  src: string;
  alt: string;
  sizes: string;
  width: number;
  height: number;
  className?: string;
};

const WIDTHS = [320, 640, 960];
const set = (src: string, ext: string) => WIDTHS.map((w) => `/images/${src}-${w}.${ext} ${w}w`).join(", ");

export default function Picture({ src, alt, sizes, width, height, className }: PictureProps) {
  return (
    <picture>
      <source type="image/avif" srcSet={set(src, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set(src, "webp")} sizes={sizes} />
      <img
        src={`/images/${src}-640.webp`}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={className}
      />
    </picture>
  );
}
