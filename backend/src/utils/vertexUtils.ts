import {Vector3Tuple} from 'three/src/math/Vector3'
import {Vector2, Vector2Tuple, Vector3} from 'three'

/**
 * Vector代表一个坐标，x和y为平面坐标，z为纵轴坐标（高度）
 */
export type Vector = {
  x: number;
  y: number;
  z: number;
};


//  顶点计算工具
class VertexUtils {
  //  求多个 vector3 的中点
  public static getVector3ListCenter = (v3List: Vector3[]): Vector3 => {
    const center = new Vector3()
    for (const v3 of v3List) {
      center.add(v3)
    }
    center.multiplyScalar(1 / v3List.length)
    return center
  }
  //  求多个 vector2 的中点
  public static getVector2ListCenter = (v2List: Vector2[]): Vector2 => {
    const center = new Vector2()
    for (const v2 of v2List) {
      center.add(v2)
    }
    center.multiplyScalar(1 / v2List.length)
    return center
  }

  //  求多个 Vector3Tuple 的中点
  public static getVector3TupleListCenter = (tuple3List: Vector3Tuple[]): Vector3Tuple =>
    VertexUtils.getVector3ListCenter(tuple3List.map(tuple => new Vector3(...tuple))).toArray()

  //  求多个 vector2 的中点
  public static getVector2TupleListCenter = (tuple2List: Vector2Tuple[]): Vector2Tuple =>
    VertexUtils.getVector2ListCenter(tuple2List.map(tuple => new Vector2(...tuple))).toArray()

  /**
   * @descriptoin 三个点是否共线，在 xz 平面上判断三点是否共线（忽略 y 轴）
   * @param {Vector3} a - 第一个点
   * @param {Vector3} b - 第二个点
   * @param {Vector3} c - 第三个点
   * @param {number} [epsilon=1e-6] - 允许的误差范围
   * @returns {boolean} 是否在 xz 平面上共线
   */
  public static areCollinearXZ = (a: Vector3, b: Vector3, c: Vector3, epsilon = 1e-6): boolean => {
    // 将所有点投影到 xz 平面（y=0）
    const aProj = new Vector3(a.x, 0, a.z)
    const bProj = new Vector3(b.x, 0, b.z)
    const cProj = new Vector3(c.x, 0, c.z)

    // 计算投影后的向量
    const ab = bProj.clone().sub(aProj)
    const ac = cProj.clone().sub(aProj)

    // 计算叉积（仅在 xz 平面，叉积的 y 分量为二维叉积值）
    const cross = new Vector3()
    cross.crossVectors(ab, ac)

    // 动态调整 epsilon（与向量长度相关）
    const dynamicEpsilon = epsilon * (ab.length() + ac.length())

    // 判断叉积的模长是否小于阈值
    return Math.abs(cross.y) < dynamicEpsilon // 注意：叉积的 y 分量即为二维叉积
  }

  public static areCollinearXZV2 = (
    a: Vector2,
    b: Vector2,
    c: Vector2,
    epsilon = 1e-6
  ): boolean => {
    return VertexUtils.areCollinearXZ(
      new Vector3(a.x, 0, a.y),
      new Vector3(b.x, 0, b.y),
      new Vector3(c.x, 0, c.y),
      epsilon
    )
  }

  //  移除重复的顶点，考虑误差 EPSILON
  public static _removeDuplicatesVectorWithEpsilon = <T extends Vector2 | Vector3>(
    vectors: T[],
    EPSILON: number
  ): T[] => {
    const uniqueVectors: T[] = []
    for (const vector of vectors) {
      let isDuplicate = false
      for (const uniqueVector of uniqueVectors) {
        if ((vector as Vector3).distanceTo(uniqueVector as Vector3) <= EPSILON) {
          isDuplicate = true
          break
        }
      }
      if (!isDuplicate) {
        uniqueVectors.push(vector)
      }
    }
    return uniqueVectors
  }

  //  移除重复的 Vector3 点，考虑误差 EPSILON
  public static epsilonRemoveDuplicatesV3 = (vectors: Vector3[], EPSILON: number): Vector3[] => {
    return VertexUtils._removeDuplicatesVectorWithEpsilon<Vector3>(vectors, EPSILON)
  }
  //  移除重复的 Vector2 点，考虑误差 EPSILON
  public static epsilonRemoveDuplicatesV2 = (vectors: Vector2[], EPSILON: number): Vector2[] => {
    return VertexUtils._removeDuplicatesVectorWithEpsilon<Vector2>(vectors, EPSILON)
  }

  //  去除重复的顶点数据 Vector3
  public static removeDuplicatesVector3 = (vertexList: Vector3[]): Vector3[] => {
    return VertexUtils._removeDuplicatesVector<Vector3>(vertexList)
  }

  //  去除重复的顶点数据 Vector2
  public static removeDuplicatesVector2 = (vertexList: Vector2[]): Vector2[] => {
    return VertexUtils._removeDuplicatesVector<Vector2>(vertexList)
  }

  //  vector3 转 vector2
  public static vector3ToVector2 = (vector3: Vector3): Vector2 => {
    return new Vector2(vector3.x, vector3.z)
  }

  //  vector2 转 vector3
  public static vector2ToVector3 = (vector2: Vector2, y = 0): Vector3 => {
    return new Vector3(vector2.x, y, vector2.y)
  }
  public static vector2ToVector3Pure = (vector2: Vector2) => {
    return new Vector3(vector2.x, 0, vector2.y)
  }

  //  vector3Line 转 vector2Line
  public static vector3LineToVector2Line = (vector3Line: Vector3[]): [Vector2, Vector2] => {
    return [
      VertexUtils.vector3ToVector2(vector3Line[0]),
      VertexUtils.vector3ToVector2(vector3Line[1]),
    ]
  }

  //  vector2Line 转 vector3Line
  public static vector2LineToVector3Line = (vector2Line: Vector2[]): [Vector3, Vector3] => {
    return [
      VertexUtils.vector2ToVector3Pure(vector2Line[0]),
      VertexUtils.vector2ToVector3Pure(vector2Line[1]),
    ]
  }

  //  vector 转 Vector3
  public static vectorToVector3 = ({x, y, z}: Vector): Vector3 => {
    return new Vector3(x, y, z)
  }

  public static vectorToVector2 = ({x, y}: { x: number; y: number }): Vector2 => {
    return new Vector2(x, y)
  }

  //  创建 Vector3
  public static createVector3ByVector = (v: Vector, transform = 0): Vector3 => {
    switch (transform) {
      case 1: {
        //  传统坐标系转 threeJs 坐标系
        return new Vector3(v.x, v.z, -v.y)
      }
      case -1: {
        //  threeJs 坐标系转传统坐标系
        return new Vector3(v.x, -v.z, v.y)
      }
      default: {
        //  默认为创建一个 Vector3
        return new Vector3(v.x, v.y, v.z)
      }
    }
  }

  /**
   * 判断三个三维向量表示的点是否共线，考虑动态误差
   * @param p1 - 第一个点
   * @param p2 - 第二个点
   * @param p3 - 第三个点
   * @param epsilon - 基础误差系数，默认为 1e-6
   *                  在方法内部，我们计算了由三个点组成的两个向量的长度，并取较短向量的长度。
   *                  然后，我们将基础误差系数乘以较短向量的长度，得到动态误差阈值。
   *                  最后，我们判断叉积的模长是否小于动态误差阈值，如果是，则认为这三个点共线。
   * @returns 是否共线
   */
  public static areCollinearVector3(
    p1: Vector3,
    p2: Vector3,
    p3: Vector3,
    epsilon = 1e-6
  ): boolean {
    // 计算由这三个点组成的两个向量
    const v1 = new Vector3().subVectors(p2, p1)
    const v2 = new Vector3().subVectors(p3, p1)

    // 计算两个向量的长度
    const len1 = v1.length()
    const len2 = v2.length()

    // 取较短向量的长度
    const minLength = Math.min(len1, len2)

    // 计算动态误差阈值
    const dynamicEpsilon = epsilon * minLength

    // 计算由这三个点组成的两个向量的叉乘
    const crossProduct = new Vector3().crossVectors(v1, v2)

    // 判断叉乘的模长是否小于动态误差阈值
    return crossProduct.lengthSq() < dynamicEpsilon * dynamicEpsilon
  }

  //  三个点是否共线
  public static areCollinearVector2(
    p1: Vector2,
    p2: Vector2,
    p3: Vector2,
    epsilon = 1e-6
  ): boolean {
    // 计算由这三个点组成的两个向量
    const v1 = new Vector2().subVectors(p2, p1)
    const v2 = new Vector2().subVectors(p3, p1)

    // 计算两个向量的长度
    const len1 = v1.length()
    const len2 = v2.length()

    // 取较短向量的长度
    const minLength = Math.min(len1, len2)

    // 计算动态误差阈值
    const dynamicEpsilon = epsilon * minLength

    // 手动计算二维向量的叉积
    const crossProduct = v1.x * v2.y - v1.y * v2.x

    // 判断叉积的绝对值是否小于动态误差阈值
    return Math.abs(crossProduct) < dynamicEpsilon
  }

  /****
   * @description 同一直线上有三个点，我想知道中间的那个点是谁
   * @description 前提：这三个点不共线
   * @param p1
   * @param p2
   * @param p3
   * @returns {Vector2}
   ***/
  public static findMiddlePointByDistanceAmongThreePoints(
    p1: Vector2,
    p2: Vector2,
    p3: Vector2
  ): 0 | 1 | 2 {
    // 计算三个点之间的距离
    const d12 = p1.distanceTo(p2)
    const d13 = p1.distanceTo(p3)
    const d23 = p2.distanceTo(p3)

    // 找出最大的距离（两端点）
    const maxDistance = Math.max(d12, d13, d23)
    // 确定中间点
    switch (maxDistance) {
      case d12: {
        return 2 // p1 和 p2 是两端，p3 是中间
      }
      case d13: {
        return 1 // p1 和 p3 是两端，p2 是中间
      }
      default: {
        return 0 // p2 和 p3 是两端，p1 是中间
      }
    }
  }

  //  去除重复的顶点数据
  private static _removeDuplicatesVector = <T extends Vector2 | Vector3>(vertexList: T[]): T[] => {
    const uniquePoints = new Set<string>()
    const result: T[] = []

    for (const vertex of vertexList) {
      const key = vertex.toArray().join(';')
      if (!uniquePoints.has(key)) {
        uniquePoints.add(key)
        result.push(vertex)
      }
    }
    return result
  }

  //  找到 Vector3List 的距离最远的两个顶点的距离
  public static findMaxDistanceInfo = (
    vector3List: Vector3[]
  ): { maxDistance: number; start: Vector3; end: Vector3 } => {
    // console.time('慢')
    let maxSquaredDistance = 0
    let startIndex = 0
    let endIndex = 0

    // 避免在循环中创建新对象，直接使用索引
    for (let i = 0; i < vector3List.length; i++) {
      const v1 = vector3List[i]
      for (let j = i + 1; j < vector3List.length; j++) {
        const v2 = vector3List[j]
        // 使用平方距离比较（避免开方运算）
        const squaredDistance = v1.distanceToSquared(v2)
        if (squaredDistance > maxSquaredDistance) {
          maxSquaredDistance = squaredDistance
          startIndex = i
          endIndex = j
        }
      }
    }

    // 最后再计算一次实际距离
    const maxDistance = Math.sqrt(maxSquaredDistance)
    // console.timeEnd('慢')
    return {
      maxDistance,
      start: vector3List[startIndex].clone(), // 按需复制
      end: vector3List[endIndex].clone(),
    }
  }
}

export {VertexUtils}
