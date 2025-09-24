
import { getSession, getAllUsers, approveSubscription } from "@/lib/actions/user";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { revalidatePath } from "next/cache";

async function ApproveButton({ userId }: { userId: string }) {
  const handleApprove = async () => {
    "use server";
    await approveSubscription(userId);
    revalidatePath("/admin");
  };

  return (
    <form action={handleApprove}>
      <Button size="sm">
        <Check className="mr-2 h-4 w-4" /> Approve
      </Button>
    </form>
  );
}

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const allUsers = await getAllUsers();
  const pendingUsers = allUsers.filter(u => u.subscription?.paymentStatus === 'pending');

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="pending" className="relative">
                  Pending Approval
                  {pendingUsers.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">{pendingUsers.length}</span>}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    A list of all users in your application.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserTable users={allUsers} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="pending">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Pending Subscriptions</CardTitle>
                  <CardDescription>
                    These users have marked their payment as complete. Please verify and approve.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserTable users={pendingUsers} showApproveButton />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

function UserTable({ users, showApproveButton = false }: { users: any[], showApproveButton?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Joined</TableHead>
            {showApproveButton && <TableHead>Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id.toString()}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarFallback className="bg-muted">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="font-medium whitespace-nowrap">{user.name}</div>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <Badge variant={user.subscription?.tier === 'premium' ? 'default' : 'secondary'} className="capitalize w-fit">
                    {user.subscription?.tier || 'free'}
                  </Badge>
                  {user.subscription?.expiresAt && (
                    <span className="text-xs text-muted-foreground mt-1">
                      Expires {new Date(user.subscription.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              {showApproveButton && (
                <TableCell>
                  <ApproveButton userId={user._id.toString()} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
