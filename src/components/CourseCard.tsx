import { Link } from "react-router-dom";
import { Star, Clock, Users } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Formation = Tables<"formations">;

interface CourseCardProps {
  course: Formation;
}

const levelColors: Record<string, string> = {
  "Débutant": "bg-success/10 text-success border-success/20",
  "Intermédiaire": "bg-warning/10 text-warning border-warning/20",
  "Avancé": "bg-destructive/10 text-destructive border-destructive/20",
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      to={`/formations/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.image_url || "/placeholder.svg"}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          width={600}
          height={400}
        />
        {course.original_price && (
          <div className="absolute top-3 left-3 rounded-full gradient-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            -{Math.round((1 - course.price / course.original_price) * 100)}%
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className={`${levelColors[course.level] || ""} border text-xs`}>
            {course.level}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
          {course.category}
        </span>
        <h3 className="mb-2 font-display text-lg font-semibold text-card-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="mb-4 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {course.short_description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-warning fill-warning" />
            {course.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {course.students_count}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {course.duration}
          </span>
        </div>

        {/* Price & Instructor */}
        <div className="flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">{course.instructor}</p>
          </div>
          <div className="text-right">
            {course.original_price && (
              <span className="block text-xs text-muted-foreground line-through">
                {formatPrice(course.original_price)}
              </span>
            )}
            <span className="text-lg font-bold font-display text-accent">
              {formatPrice(course.price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
