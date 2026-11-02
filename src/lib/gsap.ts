import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const HOVER_FINE = "(hover: hover) and (pointer: fine)";

export { gsap, useGSAP, ScrollTrigger, SplitText };
