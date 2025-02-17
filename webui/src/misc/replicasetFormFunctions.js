import * as R from 'ramda';
import { VSHARD_STORAGE_ROLE_NAME } from 'src/constants';

export const getDependenciesString = (dependencies: ?string[]) => {
  if (!dependencies || !dependencies.length)
    return '';

  return dependencies.length > 3
    ? ` (+ ${dependencies.slice(0, 2).join(', ')}, ${dependencies.length - 2} more)`
    : ` (+ ${dependencies.join(', ')})`;
};

export const getRolesDependencies = (activeRoles, rolesOptions = []) => {
  const result = [];
  rolesOptions.forEach(({ name, dependencies }) => {
    if (activeRoles.includes(name) && dependencies) {
      result.push(...dependencies);
    }
  });
  return R.uniq(result);
};

export const isVShardGroupInputDisabled = (
  roles?: string[],
  replicaset: ?Replicaset
): boolean => !(roles || []).includes(VSHARD_STORAGE_ROLE_NAME) || !!(replicaset && replicaset.vshard_group);

export const validateForm = ({
  alias,
  roles,
  vshard_group,
  weight
}) => {
  const errors = {};

  if (typeof weight === 'string') {
    const numericWeight = Number(weight);

    if (isNaN(numericWeight) || numericWeight < 0 || numericWeight % 1) {
      errors.weight = 'Field accepts number, ex: 0, 1, 2...'
    }
  }

  if (alias.length > 63) {
    errors.alias = 'Alias must not exceed 63 character';
  } else if (alias.length && !(/^[a-zA-Z0-9-_.]+$/).test(alias)) {
    errors.alias = 'Alias must contain only alphanumerics [a-zA-Z], dots (.), underscores (_) or dashes (-)';
  }

  if ((roles || []).includes(VSHARD_STORAGE_ROLE_NAME) && !vshard_group) {
    errors.vshard_group = `Group is required for ${VSHARD_STORAGE_ROLE_NAME} role`;
  }

  return errors;
};
