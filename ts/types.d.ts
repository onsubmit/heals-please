declare module "*.html" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: any;
  export = value;
}
