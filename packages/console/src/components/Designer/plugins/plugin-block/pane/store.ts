import { Block } from '../common';

class BlockStore {
  store;

  constructor() {
    this.store = new Map();
  }

  init(blocks: Block[]) {
    for (const block of blocks) {
      const { id } = block;
      this.store.set(`${id}`, block);
    }
  }

  set(id: string, snippets: any) {
    this.store.set(id, snippets);
  }

  get(id: string) {
    return this.store.get(id);
  }
}

const singleton = new BlockStore();

export default singleton;
