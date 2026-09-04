interface JoplinContentScripts {
  register(type: any, id: string, scriptPath: string): Promise<void>;
}
interface JoplinPlugins {
  register(plugin: { onStart: () => Promise<void> }): void;
}
interface Joplin {
  plugins: JoplinPlugins;
  contentScripts: JoplinContentScripts;
}
declare const joplin: Joplin;
export default joplin;
