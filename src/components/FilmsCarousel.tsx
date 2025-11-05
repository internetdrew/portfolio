import type { FilmsCollection } from "./ShortFilms.astro";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { slugify } from "@/utils";

const FilmsCarousel = ({ films }: { films: FilmsCollection }) => {
  return (
    <Carousel className="mx-10 md:mx-0 py-4">
      <CarouselContent>
        {films.map((film, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 ">
            <div className="rounded-lg overflow-hidden relative isolate group">
              <img
                src={film.data.poster.src}
                alt={film.data.title}
                className="group-hover:scale-105 transition-all duration-200 opacity-80 group-hover:opacity-70"
              />
              <a
                href={`/films/${slugify(film.data.title)}`}
                className="absolute inset-0 z-10 top-4 left-4 font-semibold"
              >
                {film.data.title}
              </a>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-10 bg-transparent size-6" />
      <CarouselNext className="-right-10 bg-transparent size-6" />
    </Carousel>
  );
};

export default FilmsCarousel;
