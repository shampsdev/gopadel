import { AboutFirst } from "./about-first";
import { AboutSecond } from "./about-second";
import { PolicyDecline } from "./policy-decline";
import { PolicyFirst } from "./policy-first";
import { PolicyRead } from "./policy-read";

export const About = {
  First: () => {
    return <AboutFirst />;
  },
  Second: () => {
    return <AboutSecond />;
  },

  Policy: {
    First: () => {
      return <PolicyFirst />;
    },
    Decline: () => {
      return <PolicyDecline />;
    },
    Read: () => {
      return <PolicyRead />;
    },
  },
};
