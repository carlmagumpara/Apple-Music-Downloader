import { useSelector } from 'react-redux';
import { saveAs } from 'file-saver';
import mime from 'mime-types';
import { titleCase, truncateString } from 'src/utils';
import { confirm } from 'src/shared/confirm';
import { useAntMessage } from 'src/context/ant-message';
import { useGetFolderTreeParentToChildMutation, useCreateFolderMutation, useCreateFileMutation, useDeleteMutation, useUploadFileMutation, useRestoreMutation, useDeleteForeverMutation } from 'src/redux/services/entities';
import { audioFormats, videoFormats, imageFormats } from 'src/media/file-formats';
import { useUploading } from 'src/context/uploading';
import { ENTITY_TYPES } from 'src/constants';
import { Buffer } from 'buffer';
import moment from 'moment';

export const useFileFolderUtils = () => {
  const antMessage = useAntMessage();
  const [getFolderTreeParentToChild] = useGetFolderTreeParentToChildMutation();
  const [createFolder] = useCreateFolderMutation();
  const [createFile] = useCreateFileMutation();
  const [_delete] = useDeleteMutation();
  const [restore] = useRestoreMutation();
  const [deleteForever] = useDeleteForeverMutation();
  const [uploadFile] = useUploadFileMutation();
  const { setUploading } = useUploading();

  const humanFileSize = (bytes = null, si = false, dp = 1) => {
    if (!bytes) return '-';

    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
  }

  const createFileObject = async (file, currentFolder) => {
    const formData = new FormData();
    const tags = {};

    if (imageFormats.includes(file.type)) {
      try {
        const thumbnail = await generateImageThumbnail(file);

        tags.picture = await generateFileFromBase64(
          thumbnail, 
          'thumbnail', 
          'image/png',
        );
      } catch(error) {
        console.log(error);
      }
    }

    if (videoFormats.includes(file.type)) {
      try {
        const thumbnail = await generateVideoThumbnail(file);

        tags.picture = await generateFileFromBase64(
          thumbnail, 
          'thumbnail', 
          'image/png',
        );
      } catch(error) {
        console.log(error);
      }
    }

    if (audioFormats.includes(file.type)) {
      try {
        const { picture, title, album, artist, genre, lyrics, year, track } = await awaitableJsmediatags(file);

        if (picture) {
          tags.picture = await generateFileFromBase64(
            `data:${picture.format};base64,${Buffer.from(picture.data).toString("base64")}`, 
            `thumbnail`, 
            picture.format
          );
        }

        tags.title = title;
        tags.album = album;
        tags.artist = artist;
        tags.genre = genre;
        tags.lyrics = lyrics;
        tags.year = year;
        tags.track = track;
      } catch(error) {
        console.log(error);
      }
    }

    formData.append('entity_id', currentFolder ?? '');
    formData.append('file', file);
    formData.append('tags', JSON.stringify(tags));

    return await createFile({ 
      data: formData, 
      path: file.path, 
      setUploading 
    }).unwrap();
  };

  const createOrRetreiveFolder = async (name, _folderUid) => {
    const folder = await createFolder({
      entity_id: _folderUid,
      name,
    }).unwrap();

    return folder?.data?.id;
  };

  const createFolders = async (file, paths = [], currentFolder = null) => {
    if (paths.length === 1) {
      return createFileObject(file, currentFolder);
    }

    const folder = await createOrRetreiveFolder(paths[0], currentFolder);

    paths.shift();

    return createFolders(file, paths, folder);
  };

  const createData = (file, index, folderUid) => {
    const paths = removeStartSlash(file.path).split('/');

    if (paths.length === 1) {
      return createFileObject(file, folderUid ?? '');
    }

    return createFolders(file, paths, folderUid ?? '');
  };

  const viewDeletedFolder = async (item, callback = null) => {
    if (await confirm({ 
      title: 'This folder is deleted', 
      confirmation: 'To view this folder, restore it from recycle bin.',
      confirmButtonText: 'Restore'
    })) {
      await restore({ id: item.id });
      callback?.();
      antMessage.success(`The ${ENTITY_TYPES[item.entityable_type]} "${item.entityable?.name}" has been restored!`);
    }
  };
  
  const deleteItem = async (item, callback = null) => {
    if (await confirm({ 
      title: `Delete ${ENTITY_TYPES[item.entityable_type]}`, 
      confirmation: `Are you sure you want to delete "${item.entityable?.name}" ${ENTITY_TYPES[item.entityable_type]}?` 
    })) {
      await _delete({ id: item.id });
      callback?.();
      antMessage.success(`The ${ENTITY_TYPES[item.entityable_type]} "${item.entityable?.name}" has been deleted!`);
    }
  };

  const deleteItems = async (isDeleted, selectedItems, clearSelectedItems = null) => {
    const key = 'deleting';
    let count = 0;
    if (await confirm({ 
      title: `Delete selected items ${isDeleted ? 'forever' : ''}`, 
      confirmation: `Are you sure you want to delete the selected items ${isDeleted ? 'forever' : ''}?` 
    })) {
      antMessage.open({
        key,
        type: 'loading',
        content: `Deleting (${count}/${selectedItems.length}) items...`,
      });
      await Promise.all(selectedItems.map(async item => {
        if (!isDeleted) {
          await _delete({ id: item });
        } else {
          await deleteForever({ id: item });
        }
        count++;
        antMessage.open({
          key,
          type: 'loading',
          content: `Deleting (${count}/${selectedItems.length}) items...`,
        });
      }));
      antMessage.open({
        key,
        type: 'success',
        content: `The selected items (${selectedItems.length}) has been deleted!`,
        duration: 3,
      });
      clearSelectedItems?.();
    }
  };

  const restoreItem = async (item, callback = null) => {
    if (await confirm({ 
      title: `Restore ${ENTITY_TYPES[item.entityable_type]}`, 
      confirmation: `Are you sure you want to restore "${item.entityable?.name}" ${ENTITY_TYPES[item.entityable_type]}?` 
    })) {
      await restore({ id: item.id });
      callback?.();
      antMessage.success(`The ${ENTITY_TYPES[item.entityable_type]} "${item.entityable?.name}" has been restored!`);
    }
  };

  const restoreItems = async (selectedItems, clearSelectedItems) => {
    const key = 'restoring';
    let count = 0;
    if (await confirm({ 
      title: `Restore selected items`, 
      confirmation: `Are you sure you want to delete the selected items?` 
    })) {
      antMessage.open({
        key,
        type: 'loading',
        content: `Deleting (${count}/${selectedItems.length}) items...`,
      });
      await Promise.all(selectedItems.map(async item => {
        await restore({ id: item });
        count++;
        antMessage.open({
          key,
          type: 'loading',
          content: `Deleting (${count}/${selectedItems.length}) items...`,
        });
      }));
      antMessage.open({
        key,
        type: 'success',
        content: `The selected items (${selectedItems.length}) has been restored!`,
        duration: 3,
      });
      clearSelectedItems();
    }
  };

  const deleteItemForever = async (item, callback = null) => {
    if (await confirm({ 
      title: `Delete ${ENTITY_TYPES[item.entityable_type]} "${truncateString(item.entityable?.name)} Forever"`, 
      confirmation: `Are you sure you want to delete "${truncateString(item.entityable?.name)}" forever?` 
    })) {
      await deleteForever({ id: item.id });
      callback?.();
      antMessage.success(`The ${ENTITY_TYPES[item.entityable_type]} "${item.entityable?.name}" has been deleted forever!`);
    }
  };

  const downloadFile = (item, callback = null) => {
    saveAs(item.entityable?.url, item.entityable?.name);
    callback?.();
  };

  const downloadItems = async (selectedItems = [], callback = null, defaultFileName = `compiled-${moment()}`) => {
    const fileName = `${defaultFileName}.zip`;

    const key = 'zipping';

    const zip = new JSZip();
    const extract = {};

    let count = 0;
    let customFileName = '';

    antMessage.open({
      key,
      type: 'loading',
      content: `Zipping (${count}/${selectedItems.length}) items...`,
    });

    await Promise.all(selectedItems.map(async item => {
      const fileTree = await getFolderTreeParentToChild({ id: item }).unwrap();
      const { paths, entities } = fileTree;

      if (selectedItems.length === 1) {
        customFileName = `${entities?.[0]?.entityable?.name}-${defaultFileName}`;
      }

      await Promise.all(entities.map(async _item => {
        if (_item.entityable_type === 'App\\Models\\Folder') {
          zip.folder(paths[_item?.id]);
        }
        if (_item.entityable_type === 'App\\Models\\Media') {
          const file = await JSZipUtils.getBinaryContent(_item?.entityable?.url);
          zip.file(paths[_item?.id], file, { binary: true});
        }
      }));
      count++;
      antMessage.open({
        key,
        type: 'loading',
        content: `Zipping (${count}/${selectedItems.length}) items...`,
      });
    }));

    zip.generateAsync({ type:'blob' }).then(content => {
      antMessage.open({
        key,
        type: 'success',
        content: 'Downloading...',
        duration: 3,
      });
      saveAs(
        content, 
        `${defaultFileName}.zip`
      )
      callback?.();
    });
  };

  const copyLink = (item, callback = null) => {
    navigator.clipboard.writeText(item.entityable?.url);
    callback?.();
    antMessage.success(`The ${ENTITY_TYPES[item.entityable_type]} "${item.entityable?.name}" link coppied!`);
  };

  const dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]), 
    n = bstr.length, 
    u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const generateImageThumbnail = (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const sourceImage = document.createElement("img");
      const ctx = canvas.getContext("2d");
      sourceImage.src = URL.createObjectURL(file);
      sourceImage.onload = () => {
        canvas.height = canvas.width * (sourceImage.height / sourceImage.width);
        const oc = document.createElement('canvas');
        const octx = oc.getContext('2d');
        oc.width = sourceImage.width * 0.75;
        oc.height = sourceImage.height * 0.75;
        octx.drawImage(sourceImage, 0, 0, oc.width, oc.height);
        ctx.drawImage(oc, 0, 0, oc.width * 0.75, oc.height * 0.75, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      sourceImage.onerror = (error) => {
        reject("Error loading image: " + error.message);
      };
    });
  };

  const generateVideoThumbnail = (file, time = 10) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const video = document.createElement("video");
      video.muted = true;
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        video.currentTime = time;
      };
      video.onseeked = () => {
        let ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        video.pause();
        resolve(canvas.toDataURL("image/png"));
      };
      video.onerror = (error) => {
        reject("Error loading video: " + error.message);
      };
    });
  };

  const awaitableJsmediatags = (file) => {
    return new Promise((resolve, reject) => {
      jsmediatags.read(file, {
        onSuccess: (tag) => resolve(tag.tags),
        onError: (error) => resolve({}),
      });
    });
  };

  const generateFileFromBase64 = async (base64, fileName = '', mimeType = '') => {
    const formData = new FormData();
    formData.append('file', dataURLtoFile(base64, `${fileName}.${mime.extension(mimeType)}`));
    return await uploadFile({ data: formData }).unwrap();
  };

  const removeStartSlash = (str = '') => str.startsWith('/') ? str.replace(/^\//, '') : str;

  const removeFileExtension = (str = '') => str.slice(0, str.lastIndexOf('.'));

  const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

  const createDataWithDelay = async (data, folderUid, callback) => {
    const results = [];
    for (const [index, item] of data.entries()) {
      if (results.length) {
        await delay(0);
      }
      const response = await createData(item, index, folderUid);
      results.push(response);

      callback(`${JSON.stringify(item)} Created!`);
    }

    return results;
  };

  return {
    createFolders,
    createOrRetreiveFolder,
    createFileObject,
    createDataWithDelay,
    copyLink,
    viewDeletedFolder,
    deleteItem,
    deleteItems,
    deleteItemForever,
    restoreItem,
    restoreItems,
    downloadFile,
    downloadItems,
    dataURLtoFile,
    generateImageThumbnail,
    generateVideoThumbnail,
    awaitableJsmediatags,
    generateFileFromBase64,
    removeStartSlash,
    removeFileExtension,
    humanFileSize
  }
}