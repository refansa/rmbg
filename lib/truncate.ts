const truncate = (string: string, limit: number): string => {
  return string.length > limit ? `${string.substring(0, limit)}...` : string;
};

export default truncate;
