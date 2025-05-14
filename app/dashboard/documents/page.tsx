"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/redux/store"
import {
  fetchDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  uploadDocumentFile,
} from "@/lib/redux/features/documents-slice"
import { fetchDepartments } from "@/lib/redux/features/departments-slice"
import { fetchCategories } from "@/lib/redux/features/categories-slice"
import { useAuth } from "@/lib/auth-context"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Plus, FileText, Pencil, Trash2, Download, Share, Upload, Building, Tag } from "lucide-react"

export default function DocumentsPage() {
  const { user } = useAuth()
  const documents = useSelector((state: RootState) => state.documents.documents)
  const { departments } = useSelector((state: RootState) => state.departments)
  const { categories } = useSelector((state: RootState) => state.categories)
  const loading = useSelector((state: RootState) => state.documents.loading)
  const error = useSelector((state: RootState) => state.documents.error)
  const dispatch = useDispatch()

  const [open, setOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    type: "document",
    category: "",
    departmentId: "",
  })

  useEffect(() => {
    // @ts-ignore
    dispatch(fetchDocuments())
    // @ts-ignore
    dispatch(fetchDepartments())
    // @ts-ignore
    dispatch(fetchCategories())
  }, [dispatch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      type: "document",
      category: "",
      departmentId: "",
    })
    setEditId(null)
    setSelectedFile(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setOpen(true)
  }

  const openEditDialog = (doc: any) => {
    setFormData({
      title: doc.title,
      description: doc.description || "",
      content: doc.content || "",
      type: doc.type || "document",
      category: doc.category || "",
      departmentId: doc.departmentId || "",
    })
    setEditId(doc.id)
    setOpen(true)
  }

  const openUploadDialog = (doc: any) => {
    setEditId(doc.id)
    setUploadOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = () => {
    if (editId) {
      // Update existing document
      // @ts-ignore
      dispatch(
        updateDocument({
          id: editId,
          documentData: formData,
        }),
      )
    } else {
      // Create new document
      // @ts-ignore
      dispatch(createDocument(formData))
    }

    setOpen(false)
    resetForm()
  }

  const handleUploadSubmit = () => {
    if (editId && selectedFile) {
      // @ts-ignore
      dispatch(
        uploadDocumentFile({
          id: editId,
          file: selectedFile,
        }),
      )
    }

    setUploadOpen(false)
    setSelectedFile(null)
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      // @ts-ignore
      dispatch(deleteDocument(id))
    }
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    if (fileUrl) {
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = fileName || "document"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const myDocuments = documents.filter((doc) => doc.createdBy === user?.id)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Create Document
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="my">My Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <DocumentsTable
              documents={documents}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onUpload={openUploadDialog}
              onDownload={handleDownload}
            />
          )}
        </TabsContent>
        <TabsContent value="my">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <DocumentsTable
              documents={myDocuments}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onUpload={openUploadDialog}
              onDownload={handleDownload}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Document" : "Create New Document"}</DialogTitle>
            <DialogDescription>
              {editId
                ? "Update the document details below."
                : "Fill in the document details below to create a new document."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                className="col-span-3"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) => handleSelectChange("departmentId", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                className="col-span-3"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2">
                Content
              </Label>
              <Textarea
                id="content"
                name="content"
                className="col-span-3"
                rows={8}
                value={formData.content}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {editId ? "Save Changes" : "Create Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Document File</DialogTitle>
            <DialogDescription>Upload a PDF or other file for this document.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                File
              </Label>
              <Input id="file" type="file" className="col-span-3" onChange={handleFileChange} />
            </div>
            {selectedFile && (
              <div className="text-sm text-gray-500 ml-[calc(25%+16px)]">
                Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUploadSubmit} disabled={!selectedFile}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DocumentsTable({
  documents,
  onEdit,
  onDelete,
  onUpload,
  onDownload,
}: {
  documents: any[]
  onEdit: (doc: any) => void
  onDelete: (id: string) => void
  onUpload: (doc: any) => void
  onDownload: (fileUrl: string, fileName: string) => void
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length > 0 ? (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    <div>
                      <div>{doc.title}</div>
                      {doc.translatedTitle && <div className="text-xs text-gray-500">{doc.translatedTitle}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center">
                      <Building className="h-4 w-4 mr-1 text-gray-500" />
                      {doc.departmentName || "None"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {doc.category ? (
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1 text-gray-500" />
                        {doc.category}
                      </span>
                    ) : (
                      "None"
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {doc.type}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(doc.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(doc)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onUpload(doc)}>
                        <Upload className="h-4 w-4" />
                      </Button>
                      {doc.fileUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDownload(doc.fileUrl, doc.fileName || "document")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(doc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No documents found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
