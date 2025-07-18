import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingList } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, ShoppingCart, Trash2, Calendar } from "lucide-react";

export default function ShoppingLists() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = "demo-user";

  const { data: shoppingLists = [], isLoading } = useQuery({
    queryKey: ["/api/shopping-lists", userId],
  });

  // Create new shopping list
  const createListMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/shopping-lists", {
        userId,
        name: newListName || "New Shopping List",
        items: [],
        createdAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists", userId] });
      setIsCreateModalOpen(false);
      setNewListName("");
      toast({
        title: "Shopping list created",
        description: "Your new shopping list has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create shopping list",
        variant: "destructive",
      });
    },
  });

  // Update shopping list items
  const updateListMutation = useMutation({
    mutationFn: async ({ listId, items }: { listId: number; items: any[] }) => {
      return apiRequest("PUT", `/api/shopping-lists/${listId}`, { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists", userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update shopping list",
        variant: "destructive",
      });
    },
  });

  // Delete shopping list
  const deleteListMutation = useMutation({
    mutationFn: async (listId: number) => {
      return apiRequest("DELETE", `/api/shopping-lists/${listId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists", userId] });
      toast({
        title: "Shopping list deleted",
        description: "The shopping list has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete shopping list",
        variant: "destructive",
      });
    },
  });

  const toggleItemChecked = (list: ShoppingList, itemIndex: number) => {
    const updatedItems = [...list.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      checked: !updatedItems[itemIndex].checked,
    };
    updateListMutation.mutate({ listId: list.id, items: updatedItems });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getListProgress = (items: any[]) => {
    if (items.length === 0) return 0;
    const checkedItems = items.filter((item) => item.checked).length;
    return Math.round((checkedItems / items.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Lists</h1>
            <p className="text-gray-600">
              {isLoading ? "Loading..." : `${shoppingLists.length} shopping lists`}
            </p>
          </div>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Shopping List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    List Name
                  </label>
                  <Input
                    placeholder="Enter list name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        createListMutation.mutate();
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createListMutation.mutate()}
                    disabled={createListMutation.isPending}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    Create List
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Shopping Lists Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : shoppingLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shoppingLists.map((list: ShoppingList) => (
              <Card key={list.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold mb-1">
                        {list.name}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(list.createdAt)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 p-1"
                      onClick={() => deleteListMutation.mutate(list.id)}
                      disabled={deleteListMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {list.items.length > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{getListProgress(list.items)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-secondary h-2 rounded-full transition-all"
                          style={{ width: `${getListProgress(list.items)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  {list.items.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {list.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleItemChecked(list, index)}
                          />
                          <span
                            className={`text-sm flex-1 ${
                              item.checked
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {item.amount} {item.ingredient}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="mx-auto h-8 w-8 mb-2" />
                      <p className="text-sm">No items added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <ShoppingCart className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No shopping lists yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first shopping list to start organizing your grocery shopping
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First List
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
