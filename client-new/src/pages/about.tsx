import { Link } from "react-router";

export const About = {
  First: () => {
    return <Link to="second">FirstSection</Link>;
  },
  Second: () => {
    return <div>SecondSection</div>;
  },

  Policy: {
    First: () => {
      return <div>First Policy Section</div>;
    },
    Decline: () => {
      return <div>Decline Policy Section</div>;
    },
    Read: () => {
      return <div>Read Policy Section</div>;
    },
  },
};
