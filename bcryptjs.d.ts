declare module 'bcryptjs' {
  function hashSync(data: string, salt: string | number): string;
  function compareSync(data: string, encrypted: string): boolean;
  function genSaltSync(rounds?: number): string;

  function hash(data: string, salt: string | number): Promise<string>;
  function hash(data: string, salt: string | number, callback: (err: Error | null, encrypted: string) => void): void;

  function compare(data: string, encrypted: string): Promise<boolean>;
  function compare(data: string, encrypted: string, callback: (err: Error | null, matched: boolean) => void): void;

  function genSalt(rounds?: number): Promise<string>;
  function genSalt(rounds: number, callback: (err: Error | null, salt: string) => void): void;

  const bcrypt: {
    hashSync: typeof hashSync;
    compareSync: typeof compareSync;
    genSaltSync: typeof genSaltSync;
    hash: typeof hash;
    compare: typeof compare;
    genSalt: typeof genSalt;
  };

  export default bcrypt;
}
