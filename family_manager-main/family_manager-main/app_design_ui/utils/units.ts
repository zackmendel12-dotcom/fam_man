export const parseUnits = (value: string, decimals: number = 18): bigint => {
  if (!value || value === '') return BigInt(0);
  
  const [integer, fraction = ''] = value.split('.');
  const fractionPadded = fraction.padEnd(decimals, '0').slice(0, decimals);
  const combined = integer + fractionPadded;
  
  return BigInt(combined);
};

export const formatUnits = (value: bigint | string | number, decimals: number = 18): string => {
  const valueStr = value.toString();
  const isNegative = valueStr.startsWith('-');
  const absoluteValue = isNegative ? valueStr.slice(1) : valueStr;
  
  if (absoluteValue === '0') return '0';
  
  const padded = absoluteValue.padStart(decimals + 1, '0');
  const integerPart = padded.slice(0, -decimals) || '0';
  const fractionalPart = padded.slice(-decimals);
  
  const trimmedFractional = fractionalPart.replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return (isNegative ? '-' : '') + integerPart;
  }
  
  return (isNegative ? '-' : '') + integerPart + '.' + trimmedFractional;
};

export const formatEther = (wei: bigint | string | number): string => {
  return formatUnits(wei, 18);
};

export const parseEther = (ether: string): bigint => {
  return parseUnits(ether, 18);
};

export const formatUsdc = (value: bigint | string | number): string => {
  return formatUnits(value, 6);
};

export const parseUsdc = (value: string): bigint => {
  return parseUnits(value, 6);
};
