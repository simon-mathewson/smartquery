import type { useToast } from '~/content/toast/useToast';

export const storeFileHandle = async (fileHandle: FileSystemFileHandle, id: string) => {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('fileHandleStorage', 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('fileHandles')) {
        db.createObjectStore('fileHandles');
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const tx = db.transaction('fileHandles', 'readwrite');
      const store = tx.objectStore('fileHandles');
      store.put(fileHandle, id);
      tx.oncomplete = () => resolve();
      tx.onerror = (error) => reject(error);
    };
  });
};

export const getFileHandle = async (id: string) => {
  return new Promise<FileSystemFileHandle>((resolve, reject) => {
    const request = indexedDB.open('fileHandleStorage', 1);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const tx = db.transaction('fileHandles', 'readonly');
      const store = tx.objectStore('fileHandles');
      const getRequest = store.get(id);
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = (error) => reject(error);
    };
  });
};

export const requestFileHandlePermission = async (
  fileHandle: FileSystemFileHandle,
  toast: ReturnType<typeof useToast>,
) => {
  try {
    await fileHandle.requestPermission({ mode: 'readwrite' });
  } catch (error) {
    toast.add({
      color: 'danger',
      title: `Unable to request permission to edit ${fileHandle.name}`,
    });
    return false;
  }

  const permission = await fileHandle.queryPermission({ mode: 'readwrite' });

  if (permission !== 'granted') {
    toast.add({ color: 'danger', title: `Please grant permission to edit ${fileHandle.name}` });
    return false;
  }

  return true;
};
