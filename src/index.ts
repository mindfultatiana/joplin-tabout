import joplin from 'api';

joplin.plugins.register({
  onStart: async function (): Promise<void> {
    console.info('[TabOut] Plugin starting…');
    try {
      await joplin.contentScripts.register(
        'codeMirrorPlugin' as any,
        'tabOutContentScript',
        './contentScript.js'
      );
      console.info('[TabOut] Content script registered successfully.');
    } catch (err) {
      console.error('[TabOut] Failed to register content script:', err);
    }
  },
});
