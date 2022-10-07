import { Layer } from '@deck.gl/core/typed';
import { DashboardLayerProps } from '../useDashboard';

/**
 * ダッシュボードアセット
 * ダッシュボードに関わるレイヤーや表示項目などを格納する
 */
export type DashboardAsset<T = {}> = {
  layers: Layer<DashboardLayerProps>[];
  info: T;
};

/**
 * メニューフックの戻り値
 */
export type UseMenuReturn<T = {}> = {
  /**
   * メニューid
   */
  menuId: string;
  /**
   * ダッシュボードアセット
   */
  asset?: DashboardAsset<T>;
  /**
   * 表示させる
   */
  show: () => void;
  /**
   * 非表示にさせる
   */
  hide: () => void;
  /**
   * ロード中かどうか
   */
  isLoading: boolean;
};
