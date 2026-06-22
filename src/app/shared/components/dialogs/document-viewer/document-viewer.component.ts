import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GenericDialogComponent } from '@shared/components/generic-dialog/generic-dialog.component';
import { ComplianceItem } from '@shared/interfaces';
import { ComplianceService } from '@features/compliances/services/compliance.service';
import { SharedModule } from '@shared/shared-module';
import { DomSanitizer } from '@angular/platform-browser';

type FileKind = 'pdf' | 'image' | 'other';

@Component({
    selector: 'app-document-viewer',
    standalone: true,
    imports: [SharedModule, GenericDialogComponent],
    templateUrl: './document-viewer.component.html',
})
export class DocumentViewerComponent implements OnInit {
    private readonly complianceService = inject(ComplianceService);
    private readonly dialogRef = inject(MatDialogRef<DocumentViewerComponent>);
    private readonly data: { compliance: ComplianceItem } = inject(MAT_DIALOG_DATA);
    private readonly sanitizer = inject(DomSanitizer);
    public readonly compliance = this.data.compliance;
    public isLoading = signal(true);
    public hasError = signal(false);
    public presignedUrl = signal<string>('');
    public fileKind = signal<FileKind>('other');

    ngOnInit(): void {
        this.complianceService.getDownloadUrl(this.compliance.id).subscribe({
            next: (response) => {


                this.presignedUrl.set(response['file']);
                this.fileKind.set(this.detectKind(this.compliance.documentUrl ?? ''));
                this.isLoading.set(false);
            },
            error: (error) => {

                this.hasError.set(true);
                this.isLoading.set(false);
            }
        });
    }

    private detectKind(key: string): FileKind {
        const ext = key.split('.').pop()?.toLowerCase() ?? '';
        if (ext === 'pdf') return 'pdf';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
        return 'other';
    }

    download(): void {
        window.open(this.presignedUrl(), '_blank', 'noopener,noreferrer');
    }

    sanitizePdf(documentUrl: string) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(documentUrl);
    }

    close(): void {
        this.dialogRef.close();
    }
}
