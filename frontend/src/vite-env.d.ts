// Vite handles CSS imports at runtime — no type checking needed
declare module '*.css' {
    const content: Record<string, string>;
    export default content;
}