import { SceneObject, ObjectType, InventorySummary } from '../types/sceneObject';

/**
 * 场景对象存储管理器（内存存储）
 * 按照 userId + conversationId 隔离不同会话的场景
 */
class SceneStorage {
  // 存储结构: Map<threadId, SceneObject[]>
  private storage: Map<string, SceneObject[]> = new Map();

  /**
   * 生成 thread ID
   */
  private getThreadId(userId: string, conversationId: string): string {
    return `modeling_${userId}_${conversationId}`;
  }

  /**
   * 添加对象到场景
   */
  addObject(userId: string, conversationId: string, object: SceneObject): void {
    const threadId = this.getThreadId(userId, conversationId);
    const objects = this.storage.get(threadId) || [];
    objects.push(object);
    this.storage.set(threadId, objects);
  }

  /**
   * 获取所有对象
   */
  getAllObjects(userId: string, conversationId: string): SceneObject[] {
    const threadId = this.getThreadId(userId, conversationId);
    return this.storage.get(threadId) || [];
  }

  /**
   * 按类型过滤对象
   */
  filterByType(userId: string, conversationId: string, type: ObjectType): SceneObject[] {
    const objects = this.getAllObjects(userId, conversationId);
    return objects.filter(obj => obj.type === type);
  }

  /**
   * 统计对象数量
   */
  countObjects(userId: string, conversationId: string): InventorySummary {
    const objects = this.getAllObjects(userId, conversationId);

    const summary: InventorySummary = {
      totalCount: objects.length,
      byType: {
        point: 0,
        line: 0,
        plane: 0,
        volume: 0,
      },
      objects: objects,
    };

    objects.forEach(obj => {
      summary.byType[obj.type]++;
    });

    return summary;
  }

  /**
   * 删除指定对象
   */
  deleteObject(userId: string, conversationId: string, objectId: string): boolean {
    const threadId = this.getThreadId(userId, conversationId);
    const objects = this.storage.get(threadId) || [];
    const index = objects.findIndex(obj => obj.id === objectId);

    if (index !== -1) {
      objects.splice(index, 1);
      this.storage.set(threadId, objects);
      return true;
    }
    return false;
  }

  /**
   * 清空场景
   */
  clearScene(userId: string, conversationId: string): void {
    const threadId = this.getThreadId(userId, conversationId);
    this.storage.set(threadId, []);
  }

  /**
   * 获取对象详情
   */
  getObject(userId: string, conversationId: string, objectId: string): SceneObject | undefined {
    const objects = this.getAllObjects(userId, conversationId);
    return objects.find(obj => obj.id === objectId);
  }
}

// 单例导出
export const sceneStorage = new SceneStorage();
