/**
 * Protocol Configuration ABI
 * For interacting with Arc Network's Protocol Configuration contract
 * Source: https://github.com/circlefin/arc-node
 */

export const PROTOCOL_CONFIG_ABI = [
  {
    name: 'getProtocolConfig',
    outputs: [
      { name: 'controller', type: 'address' },
      { name: 'pauser', type: 'address' },
      { name: 'beneficiary', type: 'address' },
      { name: 'alpha', type: 'uint256' },
      { name: 'kRate', type: 'uint256' },
      { name: 'inverseElasticityMultiplier', type: 'uint256' },
      { name: 'minBaseFee', type: 'uint256' },
      { name: 'maxBaseFee', type: 'uint256' },
      { name: 'blockGasLimit', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'setController',
    inputs: [{ name: '_controller', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'setPauser',
    inputs: [{ name: '_pauser', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'setBeneficiary',
    inputs: [{ name: '_beneficiary', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'setFeeParams',
    inputs: [
      { name: '_alpha', type: 'uint256' },
      { name: '_kRate', type: 'uint256' },
      { name: '_inverseElasticityMultiplier', type: 'uint256' },
      { name: '_minBaseFee', type: 'uint256' },
      { name: '_maxBaseFee', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'setBlockGasLimit',
    inputs: [{ name: '_blockGasLimit', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
