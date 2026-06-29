import { Badge } from "@/components/ui/badge";
import {
  COUPON_STATUS_LABELS,
  type getCouponStatus,
} from "@/lib/store/coupon-utils";
import { cn } from "@/lib/utils";

type CouponStatus = ReturnType<typeof getCouponStatus>;

const STATUS_CLASS: Record<CouponStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  expired: "border-amber-200 bg-amber-50 text-amber-700",
  exhausted: "border-orange-200 bg-orange-50 text-orange-700",
  inactive: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

export function CouponStatusBadge({ status }: { status: CouponStatus }) {
  return (
    <Badge variant="outline" className={cn("rounded-md", STATUS_CLASS[status])}>
      {COUPON_STATUS_LABELS[status]}
    </Badge>
  );
}
