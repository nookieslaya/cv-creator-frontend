export type CvTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  skills: {
    layout: "list" | "inline" | "grouped";
  };
  fontScale: {
    name: number;
    section: number;
    body: number;
    meta: number;
  };
  spacing: {
    section: number;
    item: number;
  };
  layout: {
    sidebarWidth?: number;
    columnGap?: number;
  };
};
