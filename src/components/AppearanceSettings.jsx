import React, { useEffect, useRef } from 'react';
import { AppUpdateSettings } from './AppUpdates';

const GROUPS = [
  {
    key: 'theme',
    title: '外觀模式',
    options: [
      { value: 'light', label: '白天' },
      { value: 'dark', label: '夜晚' },
      { value: 'system', label: '跟隨系統' },
    ],
  },
  {
    key: 'view',
    title: '顯示方式',
    options: [
      { value: 'grid', label: '圖卡' },
      { value: 'list', label: '列表' },
    ],
  },
];

export default function AppearanceSettings({
  open,
  onClose,
  appearance,
  onChange,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      id="appearance-settings"
      className="appearance-dialog"
      aria-labelledby="appearance-settings-title"
      aria-describedby="appearance-settings-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;

        const bounds =
          event.currentTarget.getBoundingClientRect();

        const outside =
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom;

        if (outside) {
          onClose();
        }
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="appearance-settings-title"
            className="text-xl font-semibold"
          >
            設定
          </h2>

          <p
            id="appearance-settings-description"
            className="appearance-muted mt-2 text-sm leading-6"
          >
            變更會立即套用，並記住於此瀏覽器。
          </p>
        </div>

        <button
          type="button"
          className="appearance-button shrink-0 px-3 py-2 text-sm"
          onClick={onClose}
          autoFocus
        >
          關閉
        </button>
      </div>

      <div className="mt-7 space-y-7">
        {GROUPS.map((group) => (
          <fieldset key={group.key}>
            <legend className="mb-3 text-sm font-medium">
              {group.title}
            </legend>

            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => (
                <label
                  key={option.value}
                  className="appearance-choice"
                >
                  <input
                    type="radio"
                    name={`appearance-${group.key}`}
                    value={option.value}
                    checked={
                      appearance[group.key] === option.value
                    }
                    onChange={() => {
                      onChange(group.key, option.value);
                    }}
                  />

                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <AppUpdateSettings />
    </dialog>
  );
}