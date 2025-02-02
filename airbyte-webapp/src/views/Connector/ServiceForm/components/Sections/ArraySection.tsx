import { FieldArray, useField } from "formik";
import React, { useMemo, useState } from "react";

import { ArrayOfObjectsEditor } from "components";
import GroupControls from "components/GroupControls";

import { FormBlock, FormGroupItem, FormObjectArrayItem } from "core/form/types";

import styles from "./ArraySection.module.scss";
import { SectionContainer } from "./common";
import { VariableInputFieldForm } from "./VariableInputFieldForm";

interface ArraySectionProps {
  formField: FormObjectArrayItem;
  path: string;
  disabled?: boolean;
}

const getItemName = (item: Record<string, string>, properties: FormBlock[]): string => {
  return Object.keys(item)
    .sort()
    .map((key) => {
      const property = properties.find(({ fieldKey }) => fieldKey === key);
      const name = property?.title ?? key;
      return `${name}: ${item[key]}`;
    })
    .join(" | ");
};

const getItemDescription = (item: Record<string, string>, properties: FormBlock[]): React.ReactNode => {
  const rows = Object.keys(item)
    .sort()
    .map((key) => {
      const property = properties.find(({ fieldKey }) => fieldKey === key);
      const name = property?.title ?? key;
      const value = item[key];
      return (
        <tr key={key}>
          <td className={styles.name}>{name}:</td>
          <td className={styles.value}>{value}</td>
        </tr>
      );
    });

  return (
    <div className={styles.description}>
      <table>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

export const ArraySection: React.FC<ArraySectionProps> = ({ formField, path, disabled }) => {
  const [field, , fieldHelper] = useField(path);
  const [editIndex, setEditIndex] = useState<number>();

  const items = useMemo(() => field.value ?? [], [field.value]);

  const { renderItemName, renderItemDescription } = useMemo(() => {
    const { properties } = formField.properties as FormGroupItem;

    const details = items.map((item: Record<string, string>) => {
      const name = getItemName(item, properties);
      const description = getItemDescription(item, properties);
      return {
        name,
        description,
      };
    });

    return {
      renderItemName: (_: unknown, index: number) => details[index].name,
      renderItemDescription: (_: unknown, index: number) => details[index].description,
    };
  }, [items, formField.properties]);

  return (
    <GroupControls
      name={path}
      key={`form-variable-fields-${formField?.fieldKey}`}
      title={formField.title || formField.fieldKey}
      description={formField.description}
    >
      <SectionContainer>
        <FieldArray
          name={path}
          render={(arrayHelpers) => (
            <ArrayOfObjectsEditor
              editableItemIndex={editIndex}
              onStartEdit={setEditIndex}
              onRemove={arrayHelpers.remove}
              items={items}
              renderItemName={renderItemName}
              renderItemDescription={renderItemDescription}
              disabled={disabled}
              editModalSize="sm"
              renderItemEditorForm={(item) => (
                <VariableInputFieldForm
                  formField={formField}
                  path={`${path}[${editIndex ?? 0}]`}
                  disabled={disabled}
                  item={item}
                  onDone={(updatedItem) => {
                    const updatedValue =
                      editIndex !== undefined && editIndex < items.length
                        ? items.map((item: unknown, index: number) => (index === editIndex ? updatedItem : item))
                        : [...items, updatedItem];

                    fieldHelper.setValue(updatedValue);
                    setEditIndex(undefined);
                  }}
                  onCancel={() => {
                    setEditIndex(undefined);
                  }}
                />
              )}
            />
          )}
        />
      </SectionContainer>
    </GroupControls>
  );
};
