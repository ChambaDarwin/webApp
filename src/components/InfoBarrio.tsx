// src/components/InfoBarrio.tsx
import { useId } from "react";
import { Col, Container, Row } from "react-bootstrap";
import type { BarrioSlug } from "../config/barrios";
import { CONTENIDO_BARRIOS } from "../config/contenidoBarrios";

interface ImageProps {
  images: string[];
}

export function ImageCarousel({ images }: ImageProps) {
  // ID único por instancia: evita que dos carruseles en la misma página
  // se controlen entre sí (el bug de "muevo uno y se mueve el otro").
  const reactId = useId();
  const carouselId = `carousel-${reactId.replace(/:/g, "")}`;

  if (images.length === 0) return null;

  return (
    <div
      id={carouselId}
      className="carousel slide overflow-hidden rounded-xl shadow-md"
      data-bs-ride="carousel"
    >
      <div className="carousel-inner rounded-xl">
        {images.map((src, index) => (
          <div
            key={src}
            className={`carousel-item ${index === 0 ? "active" : ""}`}
          >
            <img
              src={src}
              className="d-block w-100"
              style={{ height: "360px", objectFit: "cover" }}
              alt={`Imagen ${index + 1}`}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target={`#${carouselId}`}
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Anterior</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target={`#${carouselId}`}
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Siguiente</span>
          </button>

          <div className="carousel-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                data-bs-target={`#${carouselId}`}
                data-bs-slide-to={index}
                className={index === 0 ? "active" : ""}
                aria-current={index === 0 ? "true" : undefined}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface Props {
  barrio: BarrioSlug;
}

export function InfoBarrio({ barrio }: Props) {
  const contenido = CONTENIDO_BARRIOS[barrio];
  if (!contenido) return null;

  return (
    <Container className="py-12">
      {contenido.bloques.map((bloque, i) => (
        <div key={bloque.titulo}>
          <Row className="items-center g-4">
            <Col xs="12">
              <div className="mb-6 flex items-center gap-2">
                <span className="text-3xl">{bloque.icono}</span>
                <h2 className="m-0 text-2xl font-bold text-[var(--ink)] sm:text-3xl">
                  {bloque.titulo}
                </h2>
              </div>
            </Col>

            <Col
              xs="12"
              md="6"
              className={i % 2 === 1 ? "order-2 order-md-1" : undefined}
            >
              {i % 2 === 1 ? (
                <div className="rounded-xl bg-[var(--bg-soft)] p-6 leading-relaxed text-[var(--ink-muted)] shadow-sm">
                  {bloque.contenido}
                </div>
              ) : (
                <ImageCarousel images={bloque.imagenes} />
              )}
            </Col>

            <Col
              xs="12"
              md="6"
              className={i % 2 === 1 ? "order-1 order-md-2" : undefined}
            >
              {i % 2 === 1 ? (
                <ImageCarousel images={bloque.imagenes} />
              ) : (
                <div className="rounded-xl bg-[var(--bg-soft)] p-6 leading-relaxed text-[var(--ink-muted)] shadow-sm">
                  {bloque.contenido}
                </div>
              )}
            </Col>
          </Row>

          {i < contenido.bloques.length - 1 && (
            <hr className="my-12 border-[var(--line)]" />
          )}
        </div>
      ))}
    </Container>
  );
}
