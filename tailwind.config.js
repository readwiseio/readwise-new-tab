module.exports = {
  mode: "jit",
  purge: {
    enabled: true,
    content: ["./src/*.tsx", "./src/*.ts"],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
