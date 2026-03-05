"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    ChevronLeft,
    ChevronRight,
    Check,
    Upload,
    Users,
    Globe,
    Lock,
    Building2,
    FileText,
    Clock
} from 'lucide-react'

interface ProjectWizardProps {
    onClose: () => void
    onSuccess: (data: any) => void
}

export const ProjectWizard: React.FC<ProjectWizardProps> = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        portfolio: '',
        priority: 'Medium',
        status: 'Draft',
        type: 'Agile',
        visibility: 'Public',
        logo: null as File | null
    })

    const steps = [
        { id: 1, title: 'Basic Information' },
        { id: 2, title: 'Team Members' },
        { id: 3, title: 'Review & Finish' }
    ]

    const nextStep = () => setStep(s => Math.min(s + 1, 3))
    const prevStep = () => setStep(s => Math.max(s - 1, 1))

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans">
            {/* Header / Toolbar */}
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <X className="size-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span>Fpsos</span>
                        <ChevronRight className="size-3" />
                        <span className="text-slate-900 font-medium">Projects</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Clock className="size-5 text-slate-400" />
                    <button onClick={onClose} className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                        <ChevronLeft className="size-4" /> Back
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col items-center py-12 px-4">
                <div className="w-full max-w-4xl">
                    {/* Title Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{steps[step - 1].title}</h1>
                        <p className="text-slate-500">Enter the basic details for your project</p>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-16 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[2px] bg-slate-200 -z-10" />
                        <div className="flex items-center gap-12">
                            {steps.map((s) => (
                                <div key={s.id} className="relative">
                                    <div className={`size-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step === s.id ? 'bg-info text-gray-900 scale-110 shadow-lg shadow-blue-100' :
                                            step > s.id ? 'bg-green-500 text-gray-900' : 'bg-slate-200 text-slate-500'
                                        }`}>
                                        {step > s.id ? <Check className="size-4" /> : s.id}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100 p-10">
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Project Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="Enter project name"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Project Code <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="e.g., PRJ-2024-001"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Portfolio <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center]"
                                            value={formData.portfolio}
                                            onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                                        >
                                            <option value="">Select Portfolio</option>
                                            <option value="Residential">Residential</option>
                                            <option value="Commercial">Commercial</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Project Priority</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Project Status <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Active">Active</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Project Type <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <div className="size-5 bg-blue-100 rounded text-blue-600 flex items-center justify-center">
                                                <Check className="size-3" />
                                            </div>
                                        </div>
                                        <select
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="Agile">Agile</option>
                                            <option value="Waterfall">Waterfall</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-semibold text-slate-700">Project Visibility</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'Public', title: 'Public', icon: Globe, desc: 'Visible to everyone in the organization' },
                                            { id: 'Team', title: 'Team', icon: Users, desc: 'Visible to workspace team members only' },
                                            { id: 'Private', title: 'Private', icon: Lock, desc: 'Visible only to project members' }
                                        ].map((v) => (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, visibility: v.id })}
                                                className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${formData.visibility === v.id ? 'border-info bg-blue-50/30' : 'border-slate-100'
                                                    }`}
                                            >
                                                <v.icon className={`size-5 mb-2 ${formData.visibility === v.id ? 'text-info' : 'text-slate-400'}`} />
                                                <div className="text-sm font-bold text-slate-900">{v.title}</div>
                                                <div className="text-caption text-slate-500 mt-1 leading-tight">{v.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-semibold text-slate-700">Project Logo</label>
                                    <div className="h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 group hover:border-blue-400 transition-all cursor-pointer">
                                        <div className="size-10 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-50 group-hover:text-blue-500">
                                            <Upload className="size-5" />
                                        </div>
                                        <span className="text-xs">Drag and drop or click to upload</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="h-64 flex items-center justify-center text-slate-400 animate-in fade-in slide-in-from-right-4 duration-500">
                                <Users className="size-12 opacity-20 mr-4" />
                                <span>Team selector logic would go here...</span>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="h-64 flex items-center justify-center text-slate-400 animate-in fade-in slide-in-from-right-4 duration-500">
                                <FileText className="size-12 opacity-20 mr-4" />
                                <span>Review summary would go here...</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                            <button
                                onClick={prevStep}
                                className={`px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={step === 3 ? () => onSuccess(formData) : nextStep}
                                className="px-8 py-2.5 rounded-xl bg-info text-gray-900 text-sm font-bold shadow-lg shadow-blue-100 hover:bg-info transition-all"
                            >
                                {step === 3 ? 'Publish Project' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
