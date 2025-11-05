import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useLocation } from "wouter"

export const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[12rem] grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  )
}

export const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string
  className: string
  background: ReactNode
  Icon: any
  description: string
  href: string
  cta: string
}) => {
  const [, setLocation] = useLocation()

  return (
    <div
      key={name}
      onClick={() => setLocation(href)}
      className={cn(
        "group relative col-span-3 flex flex-col justify-center items-center overflow-hidden rounded-xl cursor-pointer",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
        className,
      )}
    >
      <div className="absolute inset-0">{background}</div>
      <div className="relative z-10 flex flex-col items-center justify-center transition-all duration-300">
        <div className="h-16 w-16 mb-3 text-slate-700 transition-all duration-300 group-hover:scale-90">
          <Icon />
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-xs font-medium text-slate-700 uppercase tracking-wide">
            {name.toLowerCase()}
          </span>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.02] group-hover:dark:bg-neutral-800/10" />
    </div>
  )
}
