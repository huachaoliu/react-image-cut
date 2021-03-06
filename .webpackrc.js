import { resolve } from 'path';

export default {
  alias: {
    '@components': resolve(__dirname, 'src/components'),
    '@utils': resolve(__dirname, 'src/utils'),
    '@assets': resolve(__dirname, 'src/assets')
  }
}