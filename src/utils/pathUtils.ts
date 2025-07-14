// ディレクトリパス操作用のユーティリティ関数

export const openDirectory = (path: string): void => {
  if (!path.trim()) return;

  // VS Code の統合ターミナルでディレクトリを開く
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // 開発環境でのみ動作するVS Code APIの呼び出し
    try {
      // VS Code拡張機能用のAPIがあれば使用
      if ((window as any).acquireVsCodeApi) {
        const vscode = (window as any).acquireVsCodeApi();
        vscode.postMessage({
          command: 'openFolder',
          path: path
        });
        return;
      }
    } catch (error) {
      console.warn('VS Code API not available:', error);
    }
  }

  // Webブラウザでの代替手段
  // Windows Explorer（Windows）
  if (navigator.platform.includes('Win')) {
    const windowsPath = path.replace(/\//g, '\\');
    const explorerUrl = `file:///${windowsPath}`;
    window.open(explorerUrl, '_blank');
    return;
  }

  // Finder（macOS）
  if (navigator.platform.includes('Mac')) {
    const finderUrl = `file://${path}`;
    window.open(finderUrl, '_blank');
    return;
  }

  // Linux/Unix系（一般的なファイルマネージャー）
  const fileUrl = `file://${path}`;
  window.open(fileUrl, '_blank');
};

export const validatePath = (path: string): boolean => {
  if (!path.trim()) return true; // 空の場合は有効

  // Windows パスのパターン
  const windowsPathPattern = /^[a-zA-Z]:[\\\/](?:[^<>:"|?*\n\r]*[\\\/]?)*$/;
  
  // Unix系パスのパターン
  const unixPathPattern = /^\/(?:[^\/\0]+\/)*[^\/\0]*$/;
  
  // 相対パスのパターン
  const relativePathPattern = /^\.{1,2}\/(?:[^\/\0]+\/)*[^\/\0]*$|^[^\/\0<>:"|?*\n\r]+(?:\/[^\/\0<>:"|?*\n\r]*)*$/;

  return windowsPathPattern.test(path) || 
         unixPathPattern.test(path) || 
         relativePathPattern.test(path);
};

export const formatPathForDisplay = (path: string): string => {
  if (!path.trim()) return '';
  
  // パスが長い場合は短縮表示
  if (path.length > 50) {
    const parts = path.split(/[\/\\]/);
    if (parts.length > 3) {
      return `${parts[0]}${path.includes('\\') ? '\\' : '/'}...${path.includes('\\') ? '\\' : '/'}${parts[parts.length - 2]}${path.includes('\\') ? '\\' : '/'}${parts[parts.length - 1]}`;
    }
  }
  
  return path;
};
