export default {
  content: ["./src/index.html", "./src/js/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        serif: ["Instrument Serif", "serif"],
      },
      colors: {
        background: "#040709",
        surface: "#0d1317",
        surfaceLight: "#182126",
        textMain: "#f9f6ec",
        textMuted: "#9aa5b1",
        accent: "#9aea62",
        accentHover: "#85d052",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
        "float-delayed": "float 8s ease-in-out 4s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        marquee: "marquee 40s linear infinite",
        blob: "blob 10s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotateX(0) rotateY(0)" },
          "50%": {
            transform: "translateY(-15px) rotateX(2deg) rotateY(-2deg)",
          },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
      },
    },
  },
};
