'use client';

// Dinamik metin listesi: Enter ile ekleme, silme, sürükleyerek sıralama (dnd-kit),
// boş/duplicate engelleme. Erişilebilir: klavye sensörü etkin.
import { useId, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function Row({
  id,
  value,
  onChange,
  onRemove,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      className="adm-list-item"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <span className="adm-drag" {...attributes} {...listeners} aria-label="Sırala">⠿</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} aria-label="Liste öğesi" />
      <button type="button" onClick={onRemove} aria-label="Öğeyi sil">✕</button>
    </div>
  );
}

export function ListEditor({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const baseId = useId();
  const [draft, setDraft] = useState('');
  const [warn, setWarn] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = values.map((_, i) => `${baseId}-${i}`);

  function add() {
    const v = draft.trim();
    if (!v) {
      setWarn('Boş kayıt eklenemez.');
      return;
    }
    if (values.some((x) => x.toLocaleLowerCase('tr') === v.toLocaleLowerCase('tr'))) {
      setWarn('Bu kayıt zaten listede.');
      return;
    }
    setWarn(null);
    onChange([...values, v]);
    setDraft('');
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    onChange(arrayMove(values, from, to));
  }

  return (
    <div className="adm-field">
      <span className="adm-label">{label}</span>
      <div className="adm-list-editor">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {values.map((v, i) => (
              <Row
                key={ids[i]}
                id={ids[i]}
                value={v}
                onChange={(nv) => onChange(values.map((x, xi) => (xi === i ? nv : x)))}
                onRemove={() => onChange(values.filter((_, xi) => xi !== i))}
              />
            ))}
          </SortableContext>
        </DndContext>
        <div className="adm-row">
          <input
            className="adm-input"
            value={draft}
            placeholder={placeholder ?? 'Yeni kayıt yazıp Enter’a basın'}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
            aria-label={`${label} — yeni kayıt`}
          />
          <button type="button" className="adm-btn adm-btn-sm" onClick={add}>Ekle</button>
        </div>
        {warn && <p className="adm-error">{warn}</p>}
      </div>
    </div>
  );
}
