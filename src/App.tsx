import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Gauge, Shield, Wind } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import gsap from 'gsap';
import ScrollReveal from './components/ScrollReveal';
import GoogleModelViewer from './components/GoogleModelViewer';

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function NavItem({ text, href }: { text: string, href: string }) {
  const [cycle, setCycle] = useState(0);

  return (
    <a
      href={href}
      className="relative overflow-hidden group flex items-center justify-center py-1"
      onMouseEnter={() => setCycle(c => c + 1)}
      onMouseLeave={() => setCycle(c => c + 1)}
    >
      {cycle === 0 ? (
        <span className="block text-white/64 group-hover:text-white transition-colors duration-300">
          {text}
        </span>
      ) : (
        <React.Fragment key={cycle}>
          <span className="block text-white/64 group-hover:text-[#E50000] transition-colors duration-300 animate-fly-out-up">
            {text}
          </span>
          <span className="absolute block text-white/64 group-hover:text-[#E50000] transition-colors duration-300 animate-fly-in-up">
            {text}
          </span>
        </React.Fragment>
      )}
    </a>
  );
}

interface CardProps {
  image: string;
  tag: string;
  title: string;
  description: string;
  specs?: { label: string; value: string }[];
  imagePosition?: 'left' | 'right' | 'center';
  className?: string;
}

function SpecCard({ image, tag, title, description, specs, imagePosition = 'right', className = '' }: CardProps) {
  const isLeft = imagePosition === 'left';
  const isCenter = imagePosition === 'center';

  if (isCenter) {
    return (
      <Reveal className="w-full max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E50000]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <img
            src={image}
            alt={title}
            className="w-full h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-12">
            <div className="text-[#E50000] font-mono tracking-[0.2em] text-xs uppercase mb-4 flex items-center gap-3">
              <span className="w-6 h-[1px] bg-[#E50000]" />
              {tag}
            </div>
            <h3 className="text-4xl font-bold text-white uppercase tracking-tight mb-4">{title}</h3>
            <p className="text-white/60 font-mono text-sm leading-relaxed max-w-xl">{description}</p>
            {specs && (
              <div className="flex gap-8 mt-6 pt-6 border-t border-white/10">
                {specs.map((spec, i) => (
                  <div key={i}>
                    <div className="text-xl font-bold text-white">{spec.value}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{spec.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal className={`w-full ${className || ''}`}>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${isLeft ? 'md:grid-flow-col' : 'md:grid-flow-col'}`}>
        <div className={`order-2 ${isLeft ? 'md:order-1' : 'md:order-2'}`}>
          <div className="text-[#E50000] font-mono tracking-[0.2em] text-xs uppercase mb-6 flex items-center gap-4">
            <span className="w-8 h-[1px] bg-[#E50000]" />
            {tag}
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight mb-6 leading-[1.1]">{title}</h3>
          <p className="text-white/60 font-mono leading-relaxed mb-8">{description}</p>
          {specs && (
            <div className="flex flex-wrap gap-6 pt-6 border-t border-white/10">
              {specs.map((spec, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[#E50000] font-mono text-xs uppercase tracking-wider">{spec.label}</span>
                  <span className="text-2xl font-bold text-white mt-1">{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={`order-1 ${isLeft ? 'md:order-2' : 'md:order-1'}`}>
          <div className="relative overflow-hidden rounded-xl border border-white/10 group cursor-pointer">
            <div className="absolute inset-0 bg-[#E50000]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
            <img
              src={image}
              alt={title}
              className="w-full aspect-[4/3] object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute bottom-4 left-4 w-8 h-8 bg-[#E50000] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 z-20">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

const ZOOM_FACTOR = 1.05;

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const screen3Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Smooth scroll progress with spring physics
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Header animation: start moving up after screen 1
  const headerY = useTransform(scrollYProgress, [0, 0.15, 0.4], [0, 0, -100]);

  // Video time based on smooth scroll progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video is loaded and ready
    const onCanPlay = () => {
      video.pause();
      video.muted = true;
    };

    video.addEventListener('canplay', onCanPlay);

    // Fallback timeout in case canplay doesn't fire
    const timeout = setTimeout(() => {
      if (video.readyState >= 2) {
        video.pause();
        video.muted = true;
      }
    }, 2000);

    let lastTime = -1;

    const updateVideo = () => {
      if (!video || !video.duration || video.readyState < 2) return;
      const progress = smoothProgress.get();
      const targetTime = Math.min(progress * video.duration, video.duration - 0.1);

      if (Math.abs(targetTime - lastTime) > 0.016) { // ~60fps threshold
        lastTime = targetTime;
        video.currentTime = targetTime;
      }
    };

    let rafId: number;
    const loop = () => {
      updateVideo();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeout);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [smoothProgress]);

  // Background slow zoom and fade
  const bgScale = useTransform(smoothProgress, [0, 1], [1, 1.15]);
  const bgOverlayOpacity = useTransform(smoothProgress, [0, 0.3, 0.8], [0.8, 0.4, 0]);

  // Hero fades as cards start appearing
  const heroOpacity = useTransform(smoothProgress, [0, 0.10, 0.18], [1, 1, 0]);
  const heroY = useTransform(smoothProgress, [0, 0.10, 0.18], [0, 0, -80]);

  // Section 1: Final Symphony - visible from 12% to 55%
  const section1Opacity = useTransform(smoothProgress, [0.12, 0.18, 0.50, 0.56], [0, 1, 1, 0]);
  const section1Y = useTransform(smoothProgress, [0.12, 0.18, 0.50, 0.56], [60, 0, 0, -60]);

  // Section 2: Quattro - visible from 52% to 75%
  const section2Opacity = useTransform(smoothProgress, [0.52, 0.58, 0.70, 0.76], [0, 1, 1, 0]);
  const section2Y = useTransform(smoothProgress, [0.52, 0.58, 0.70, 0.76], [60, 0, 0, -60]);

  // Section 3: V10 Power - visible from 72% to 100%
  const section3Opacity = useTransform(smoothProgress, [0.72, 0.78, 1.0, 1.0], [0, 1, 1, 1]);
  const section3Y = useTransform(smoothProgress, [0.72, 0.78, 1.0, 1.0], [60, 0, 0, 0]);

  // 3D viewer stays visible at the end, no animation
  const final3DOpacity = useTransform(smoothProgress, [0.85, 0.85], [1, 1]);

  // 3D viewer transforms - disabled to just leave it static
  const rotateX = useTransform(smoothProgress, [0, 1], [0, 0]);
  const viewerY = useTransform(smoothProgress, [0, 1], [0, 0]);
  const viewerScale = useTransform(smoothProgress, [0, 1], [1, 1]);

  // Mouse Parallax for the video container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      gsap.to(container, {
        x: -x,
        y: -y,
        duration: 1.2,
        ease: "power2.out"
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div className="relative w-full bg-[#050505] text-[#EDEDED] font-sans selection:bg-[#E50000] selection:text-white">

        {/* Fixed Background Video (Scroll-Scrubbed) */}
        <div className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden bg-black">
          <motion.div
            ref={containerRef}
            className="w-full h-full"
            style={{ scale: bgScale }}
          >
            <video
              ref={videoRef}
              src="/Audi_R8_driving_202604212205.mp4"
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-black pointer-events-none"
            style={{ opacity: bgOverlayOpacity }}
          />
        </div>

        {/* Fixed Header */}
        <motion.header
          style={{ y: headerY }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-20 w-[90%] flex items-center justify-between pointer-events-auto py-4 md:py-6 lg:py-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="text-xl font-bold tracking-[0.1em] text-white uppercase flex items-center">
              Audi<span className="text-[#E50000] font-light ml-2">Sport</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden lg:flex items-stretch bg-black/40 backdrop-blur-xl border border-white/5 rounded-full pl-6">
            <div className="flex items-center justify-between font-mono text-xs tracking-[0.1em] gap-8 mr-6">
              <NavItem text="V10 ENGINE" href="#v10-power" />
              <NavItem text="QUATTRO" href="#quattro" />
              <NavItem text="DYNAMICS" href="#final-symphony" />
              <NavItem text="HISTORY" href="#r8-performance" />
            </div>
            <button className="bg-[#E50000] text-white px-8 py-4 font-mono text-xs font-bold tracking-widest hover:bg-white hover:text-black transition-colors rounded-r-full">
              BUILD YOURS
            </button>
          </nav>
        </motion.header>

        {/* Scrollable Content */}
        <div ref={scrollContainerRef} className="relative z-10 w-full pointer-events-none">

          {/* Spacer for smooth scroll timing */}
          <div className="h-[400vh] w-full relative">

            {/* Main Hero Section - fades as you scroll */}
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
              <motion.div
                style={{ opacity: heroOpacity, y: heroY }}
                className="w-[90%] mx-auto h-full flex flex-col justify-center py-8 md:py-12 lg:py-16"
              >
                <main className="w-full pointer-events-auto flex flex-col md:grid md:grid-cols-12 gap-y-8 md:gap-y-0 md:gap-x-8">
                  {/* Left Heading */}
                  <div className="md:col-start-1 md:col-span-8 flex items-end">
                    <Reveal delay={0.2}>
                      <div className="text-[#E50000] font-mono tracking-[0.2em] text-xs mb-6 uppercase flex items-center gap-4">
                        <span className="w-8 h-[1px] bg-[#E50000]"></span>
                        Naturally Aspirated
                      </div>
                      <h1 className="text-[clamp(3.5rem,8vw,7rem)] leading-[0.9] font-bold tracking-tighter text-white uppercase drop-shadow-2xl">
                        The Audi<br />
                        R8 V10
                      </h1>
                    </Reveal>
                  </div>

                  {/* Right Text Content */}
                  <div className="md:col-start-8 md:col-span-5 flex flex-col justify-center items-start md:items-end text-left md:text-right">
                    <Reveal delay={0.3}>
                      <p className="text-[clamp(1rem,1.2vw,1.125rem)] text-white leading-[1.6] font-normal max-w-[420px] font-mono drop-shadow-lg">
                        Forged in the crucible of Le Mans. Engineered for the open road. The final symphony of the legendary 5.2-liter scream. <span className="text-[#E50000] block mt-2">Unapologetic performance.</span>
                      </p>
                    </Reveal>
                  </div>
                </main>
              </motion.div>
            </div>
          </div>

          {/* Section 1 - Card with image LEFT */}
          <motion.div
            id="final-symphony"
            style={{ opacity: section1Opacity, y: section1Y }}
            className="relative z-20 bg-gradient-to-b from-transparent to-[#050505] py-32 pointer-events-auto"
          >
            <div className="w-[90%] mx-auto">
              <SpecCard
                image="/audi-r8-hero.jpg"
                tag="Project Overview"
                title="The Final Symphony"
                description="The R8 V10 is the pinnacle of Audi engineering. A mid-engine masterpiece that combines the raw power of a naturally aspirated V10 with the precision of Quattro all-wheel drive. This is not just a car; it's the culmination of decades of racing dominance, distilled into a street-legal weapon."
                specs={[
                  { label: "Engine", value: "5.2L V10" },
                  { label: "Output", value: "602 HP" },
                  { label: "0-60", value: "3.1 SEC" }
                ]}
                imagePosition="left"
              />
            </div>
          </motion.div>

          {/* Section 2 - Center featured card */}
          <motion.div
            id="quattro"
            style={{ opacity: section2Opacity, y: section2Y }}
            className="relative z-20 py-32 pointer-events-auto"
          >
            <div className="w-[90%] mx-auto">
              <SpecCard
                image="/audi-r8-rear.jpg"
                tag="Quattro System"
                title="All-Wheel Dominance"
                description="The intelligent Quattro all-wheel-drive system delivers power exactly where you need it. In a straight line, off the line, or through a corner at the limit—the R8 grips like nothing else on the road."
                specs={[
                  { label: "Drive", value: "AWD" },
                  { label: "Torque", value: "413 LB-FT" },
                  { label: "Top Speed", value: "205 MPH" }
                ]}
                imagePosition="center"
              />
            </div>
          </motion.div>

          {/* Section 3 - Card with image RIGHT */}
          <motion.div
            id="v10-power"
            style={{ opacity: section3Opacity, y: section3Y }}
            className="relative z-20 py-32 pointer-events-auto"
          >
            <div className="w-[90%] mx-auto">
              <SpecCard
                image="/audi-r8-engine.jpg"
                tag="V10 Power"
                title="8,700 RPM Symphony"
                description="The naturally aspirated 5.2-liter FSI V10 engine delivers a chilling, symphonic howl that climbs relentlessly to the redline. 50% shared parts with the R8 LMS GT3 race car—the ultimate inheritance."
                specs={[
                  { label: "Displacement", value: "5.2L" },
                  { label: "Redline", value: "8,700" },
                  { label: "Compression", value: "12.5:1" }
                ]}
                imagePosition="left"
              />
            </div>
          </motion.div>

          {/* Section 4 - 3D Model Viewer (Final) */}
          <motion.div
            id="r8-performance"
            style={{ opacity: final3DOpacity }}
            ref={screen3Ref}
            className="relative z-20 w-full h-[200vh] pointer-events-auto"
          >
            <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden p-8">
              <motion.div
                style={{
                  rotateX,
                  y: viewerY,
                  scale: viewerScale,
                  transformOrigin: "bottom center"
                }}
                className="w-full max-w-[1400px] h-[85vh] bg-[#0A0A0A] border border-white/10 flex flex-col items-center justify-center relative rounded-2xl overflow-hidden shadow-[0_0_120px_rgba(229,0,0,0.15)]"
              >
                {/* Background */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#0A0A0A] via-black to-[#050505]" />

                {/* Top Left: Title & Subtitle */}
                <div className="absolute top-8 left-8 z-10 pointer-events-none flex flex-col gap-2">
                  <h3 className="text-[20px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-4 h-4 bg-[#E50000] inline-block"></span>
                    R8 V10 Performance
                  </h3>
                  <p className="text-[12px] font-mono text-white/50 uppercase tracking-widest mt-1">
                    Interactive 3D Viewer
                  </p>
                </div>

                {/* Top Right: Specs */}
                <div className="absolute top-8 right-8 z-10 pointer-events-none">
                  <table className="font-mono text-[10px] tracking-widest uppercase text-white/80 border-separate border-spacing-x-6 border-spacing-y-2">
                    <tbody>
                      <tr>
                        <td className="text-right text-[#E50000]">0-60 MPH:</td>
                        <td className="text-left font-bold text-white">3.1 SEC</td>
                      </tr>
                      <tr>
                        <td className="text-right text-[#E50000]">TOP SPEED:</td>
                        <td className="text-left font-bold text-white">205 MPH</td>
                      </tr>
                      <tr>
                        <td className="text-right text-[#E50000]">OUTPUT:</td>
                        <td className="text-left font-bold text-white">602 HP</td>
                      </tr>
                      <tr>
                        <td className="text-right text-[#E50000]">TORQUE:</td>
                        <td className="text-left font-bold text-white">413 LB-FT</td>
                      </tr>
                      <tr>
                        <td className="text-right text-[#E50000]">ENGINE:</td>
                        <td className="text-left font-bold text-white">5.2L FSI V10</td>
                      </tr>
                      <tr>
                        <td className="text-right text-[#E50000]">WEIGHT:</td>
                        <td className="text-left font-bold text-white">3,516 LBS</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Google Model Viewer */}
                <div className="w-full h-full flex items-center justify-center relative z-10">
                  <GoogleModelViewer
                    src="/2023_audi_r8_coupe_v10_gt_rwd.glb.glb"
                    poster="/audi-r8-hero.jpg"
                    autoRotate={true}
                    cameraControls={true}
                    shadowIntensity={1.5}
                    exposure={0.8}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}
