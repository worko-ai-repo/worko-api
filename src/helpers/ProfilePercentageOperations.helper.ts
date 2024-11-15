import { UserProfilePercentage } from "../configs/constants/UserProfilePercentage.constant";
import {
  FieldDTO,
  FieldGroupDTO,
  UserProfilePercentageDTO,
} from "../dtos/UserProfilePercentage.dto";

// import helpers
import { isFalsyOrEmpty } from "./common.helper";

/**
 * Helper class for managing operations on UserProfilePercentageDTO.
 */
export class UserProfilePercentageOperationHelper {
  /**
   * Initialize and calculate curPerc for a single field group.
   * @param fieldGroup - The field group to initialize.
   * @returns The initialized FieldGroupDTO.
   */
  static initializeFieldGroup(
    fieldGroup: (typeof UserProfilePercentage.candidate)[0]
  ): FieldGroupDTO {
    const fields: FieldDTO[] = fieldGroup.fields.map((field) => ({
      field: field.field,
      expPerc: field.expPerc,
      curPerc: 0,
    }));

    return {
      fieldGroup: fieldGroup.fieldGroup,
      expPerc: fieldGroup.expPerc,
      curPerc: 0,
      fields,
    };
  }

  /**
   * Initialize and calculate curPerc for all field groups.
   * @param fieldGroups - Array of field groups to initialize.
   * @returns An array of initialized FieldGroupDTOs.
   */
  static initializeDTO(
    fieldGroups: typeof UserProfilePercentage.candidate
  ): FieldGroupDTO[] {
    return fieldGroups.map((fieldGroup) =>
      this.initializeFieldGroup(fieldGroup)
    );
  }

  /**
   * Create a UserProfilePercentageDTO with initialized field groups.
   * @returns The created UserProfilePercentageDTO.
   */
  static createUserProfilePercentageDTO(): UserProfilePercentageDTO {
    return {
      candidate: this.initializeDTO(UserProfilePercentage.candidate),
      employee: this.initializeDTO(UserProfilePercentage.employee),
    };
  }

  /**
   * Update curPerc based on key-value pairs in the updateObject.
   * @param userProfilePercentageDTO - The original UserProfilePercentageDTO.
   * @param updateObject - Key-value pairs to update curPerc values.
   * @returns The updated UserProfilePercentageDTO.
   */
  static updateCurPerc(
    userProfilePercentageDTO: UserProfilePercentageDTO,
    updateObject: Record<string, any>
  ): UserProfilePercentageDTO {
    const updatedDTO: UserProfilePercentageDTO = {
      candidate: this.updateFields(
        userProfilePercentageDTO.candidate,
        updateObject
      ),
      employee: this.updateFields(
        userProfilePercentageDTO.employee,
        updateObject
      ),
    };

    return updatedDTO;
  }

  /**
   * Helper function to update fields and calculate new curPerc values.
   *
   * `fieldGroups` are either `candidate` or `employee`, check `UserProfilePercentage.constant.ts`
   *
   * @param fieldGroups - Array of field groups to update.
   * @param updateObject - Key-value pairs for updating curPerc values.
   * @returns The updated array of FieldGroupDTOs.
   */
  private static updateFields(
    fieldGroups: FieldGroupDTO[], // `fieldGroups` are the existing pecentage values for each field in the database
    updateObject: Record<string, any> // `updateObject` will come from request payload(From Frontend)
  ): FieldGroupDTO[] {
    const fieldGroupsUpdated: FieldGroupDTO[] = fieldGroups.map(
      (fieldGroup: FieldGroupDTO) => {
        const updatedFields: FieldDTO[] = fieldGroup.fields.map(
          (field: FieldDTO) => {
            /**
             * if `isCandidateFresher` is `false` and `candidateExperience` is not `undefined`
             * then we need to iterate through `candidateExperience` object and check if
             * the "updateKey" exists in the `candidateExperience` object is matching with
             * "field.field" and if it exists then assign `expPerc` to `curPerc` for that field and return the updated field
             */
            if (
              updateObject.isCandidateFresher === false &&
              updateObject.candidateExperience !== undefined
            ) {
              /**
               * Sample Example of `candidateExperience`:-
               *
               * candidateExperience:{
               *    "department":"Backend",
               *    "companyName":"WORKO",
               *    "designation":"developer"
               *  }
               */

              // Iterate through candidateExperience object and check if the "updateKey" exists
              const candidateExperienceObjKey: string | undefined = Object.keys(
                updateObject.candidateExperience
              ).find((updateKey: string) => updateKey === field.field);

              // if candidateExperienceObjKey exists then assign expPerc to curPerc for that field and return the updated field
              if (candidateExperienceObjKey) {
                global.logger.debug("candidateExperienceObjKey exists: ", {
                  filePath: __filename,
                  methodName: this.updateFields.name,
                  keyName: candidateExperienceObjKey,
                  value:
                    updateObject.candidateExperience[candidateExperienceObjKey],
                  expPerc: field.expPerc
                });
                
                // check if the value is `falsy` or `empty` and return the updated field accordingly
                if (isFalsyOrEmpty(updateObject.candidateExperience[candidateExperienceObjKey])) {
                  return {
                    ...field,
                    curPerc: 0,
                  };
                } else {
                  return {
                    ...field,
                    curPerc: field.expPerc,
                  };
                }        
              }
            }

            //and if its true so
            const key: string | undefined = Object.keys(updateObject).find(
              (updateKey: string) => {
                return updateKey === field.field;
              }
            );

            if (key) {
              global.logger.debug(" `key` exists: ", {
                filePath: __filename,
                methodName: this.updateFields.name,
                keyName: key,
                value: updateObject[key],
                expPerc: field.expPerc
              });

              // check if the value is `falsy` or `empty` and return the updated field accordingly
              if (isFalsyOrEmpty(updateObject[key])) {
                return {
                  ...field,
                  curPerc: 0,
                }
              } else {
                return {
                  ...field,
                  curPerc: field.expPerc
                }
              }
            }

            return field;
          }
        );

        /**
         * Syntax:-
         * array.reduce(function(previousValue, nextValue, currentIndex, arr), initialValue)
         */
        const curPerc: number = updatedFields.reduce(
          (total: number, field: FieldDTO) => total + field.curPerc,
          0
        );

        const fieldGroupObjectUpdated: FieldGroupDTO = {
          ...fieldGroup,
          curPerc,
          fields: updatedFields,
        };

        return fieldGroupObjectUpdated;
      }
    );

    return fieldGroupsUpdated;
  }

  /**
   * Update curPerc based on an array of keys in the keys parameter.
   * @param userProfilePercentageDTO - The original UserProfilePercentageDTO.
   * @param keys - Array of keys to update curPerc values.
   * @returns The updated UserProfilePercentageDTO.
   */
  static updateFieldCurPercByKeys(
    userProfilePercentageDTO: UserProfilePercentageDTO,
    keys: string[]
  ): UserProfilePercentageDTO {
    const updatedDTO: UserProfilePercentageDTO = {
      candidate: this.updateFieldsByKeys(
        userProfilePercentageDTO.candidate,
        keys
      ),
      employee: this.updateFieldsByKeys(
        userProfilePercentageDTO.employee,
        keys
      ),
    };

    return updatedDTO;
  }

  /**
   * Helper function to update fields based on an array of keys.
   * @param fieldGroups - Array of field groups to update.
   * @param keys - Array of keys to update curPerc values.
   * @returns The updated array of FieldGroupDTOs.
   */
  private static updateFieldsByKeys(
    fieldGroups: FieldGroupDTO[],
    keys: string[]
  ): FieldGroupDTO[] {
    return fieldGroups.map((fieldGroup) => {
      const updatedFields: FieldDTO[] = fieldGroup.fields.map((field) => {
        if (keys.includes(field.field)) {
          return {
            ...field,
            curPerc: field.expPerc,
          };
        }

        return field;
      });

      const curPerc = updatedFields.reduce(
        (total, field) => total + field.curPerc,
        0
      );

      return {
        ...fieldGroup,
        curPerc,
        fields: updatedFields,
      };
    });
  }
}
