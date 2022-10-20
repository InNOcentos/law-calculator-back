import * as path from 'path';
import * as fs from 'fs';

export const getPackageVersion = (): string => {
  const root = path.join(process.cwd(), 'package.json');
  const file = fs.readFileSync(root);
  const conf = JSON.parse(file.toString());
  return conf['version'] || '';
};

export const getDocumentationFolderPath = (): string => {
  return path.join(process.cwd(), '/docs');
};

export const rewriteDocument = (swaggerDoc: object): void => {
  const root = getDocumentationFolderPath();
  const doc = path.join(root, 'api.json');
  if (!fs.existsSync(root)) fs.mkdirSync(root);
  if (fs.existsSync(doc)) fs.rmSync(doc);
  fs.writeFileSync(doc, JSON.stringify(swaggerDoc, null, 2));
};
