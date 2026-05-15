'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, FileImage, FileText, Camera, Loader2, Plus, Trash2 } from 'lucide-react';
import { InvoiceItem, Member } from '../types';

interface AddInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  groupMembers: Member[];
  onSave: (invoiceData: {
    merchant: string;
    date: string;
    total: number;
    items: InvoiceItem[];
    whoPaid: string;
  }) => void;
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'extracted';

export function AddInvoiceModal({ open, onClose, onSave, groupMembers }: AddInvoiceModalProps) {
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [manualEntry, setManualEntry] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [whoPaid, setWhoPaid] = useState('');

  const handleStartManualEntry = () => {
    setManualEntry(true);
    setUploadState('idle');
    setDate(new Date().toISOString().split('T')[0]);
    setItems([
      {
        id: `item-${Date.now()}`,
        name: '',
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const simulateOCRExtraction = useCallback(() => {
    setUploadState('uploading');

    setTimeout(() => {
      setUploadState('processing');
    }, 800);

    setTimeout(() => {
      setMerchant('Whole Foods Market');
      setDate(new Date().toISOString().split('T')[0]);
      setWhoPaid(groupMembers[0]?.id || '');
      setItems([
        {
          id: `item-${Date.now()}-1`,
          name: 'Organic Vegetables',
          quantity: 1,
          price: 24.99,
        },
        {
          id: `item-${Date.now()}-2`,
          name: 'Milk & Dairy',
          quantity: 2,
          price: 15.98,
        },
        {
          id: `item-${Date.now()}-3`,
          name: 'Fresh Bread',
          quantity: 1,
          price: 4.5,
        },
        {
          id: `item-${Date.now()}-4`,
          name: 'Tax',
          quantity: 1,
          price: 3.62,
        },
      ]);
      setUploadState('extracted');
    }, 2500);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        simulateOCRExtraction();
      }
    },
    [simulateOCRExtraction]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        simulateOCRExtraction();
      }
    },
    [simulateOCRExtraction]
  );

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        name: '',
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const handleItemChange = (
    itemId: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const handleSave = () => {
    const total = calculateTotal();
    onSave({ merchant, date, total, items, whoPaid });
    handleClose();
  };

  const handleClose = () => {
    setMerchant('');
    setDate('');
    setItems([]);
    setManualEntry(false);
    setUploadState('idle');
    setDragActive(false);
    setWhoPaid('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {manualEntry ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant Name</Label>
                  <Input
                    id="merchant"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="Enter merchant name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whoPaid">Paid By</Label>
                  <Select value={whoPaid} onValueChange={setWhoPaid}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select who paid" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Line Items</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleAddItem}
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(item.id, 'name', e.target.value)
                          }
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              'quantity',
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="1"
                        />
                      </div>
                      <div className="w-28">
                        <Input
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              'price',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span>Total Amount</span>
                  <span className="text-2xl">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Invoice</Button>
              </div>
            </div>
          ) : uploadState === 'idle' ? (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="mb-1">Drag and drop your invoice here</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                  </div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileInput}
                  />
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <FileImage className="h-4 w-4" />
                      Upload Image
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <FileText className="h-4 w-4" />
                      Upload PDF
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Scan
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-lg font-semibold">Or enter the bill manually</div>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Add the invoice details manually if you don't want to upload a file right now.
                  </p>
                  <Button onClick={handleStartManualEntry}>Start manual entry</Button>
                </div>
              </div>
            </>
          ) : uploadState === 'uploading' || uploadState === 'processing' ? (
            <div className="border border-border rounded-lg p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div>
                  <p className="mb-1">
                    {uploadState === 'uploading'
                      ? 'Uploading invoice...'
                      : 'Extracting invoice data...'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This may take a few seconds
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
                <p>✓ Invoice data extracted successfully. Please review and edit if needed.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant Name</Label>
                  <Input
                    id="merchant"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="Enter merchant name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whoPaid">Paid By</Label>
                  <Select value={whoPaid} onValueChange={setWhoPaid}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select who paid" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Line Items</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleAddItem}
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(item.id, 'name', e.target.value)
                          }
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              'quantity',
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="1"
                        />
                      </div>
                      <div className="w-28">
                        <Input
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              'price',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span>Total Amount</span>
                  <span className="text-2xl">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Invoice</Button>
              </div>
            </div>
          )}

          {!manualEntry && uploadState === 'idle' && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
