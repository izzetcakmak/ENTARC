/**
 * Validator Manager ABI
 * For interacting with Arc Network's Validator Management contract
 * Source: https://github.com/circlefin/arc-node
 */

export const VALIDATOR_MANAGER_ABI = [
  {
    name: 'registerValidator',
    inputs: [{ name: 'validator', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'deregisterValidator',
    inputs: [{ name: 'validator', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'isValidator',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'getValidators',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'getValidatorCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];
