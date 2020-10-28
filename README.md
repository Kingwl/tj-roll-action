# 天津机动车摇号结果查询

## 参数
- `apply-code`: 分配的申请码
- `issue-number`: 期数，默认为最近 6 期

## 输出
- `result`: 摇号结果, true or false, true 为中签
- `name`: 若中签，则为中签人姓名

## 使用方法

```yaml
- name: Tj roll action step
  uses: ./
  id: roll
  with:
    apply-code: ${{ secrets.TEST_APPLY_CODE }}
- name: Get the result
  run: echo "The result was ${{ steps.roll.outputs.result }} ${{ steps.roll.outputs.name }}"
```
