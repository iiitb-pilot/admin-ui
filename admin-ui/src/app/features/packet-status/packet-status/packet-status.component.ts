import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/app-config.service';
import { AuditService } from 'src/app/core/services/audit.service';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-packet-status',
  templateUrl: './packet-status.component.html',
  styleUrls: ['./packet-status.component.scss']
})
export class PacketStatusComponent implements OnInit {
  data = [
    // {
    //   stageName: 'Virus Scan',
    //   date: '19 Jun 2019',
    //   time: '09:30',
    //   status: 'Completed'
    // }
  ];

  showDetails = false;
  showTimeline = false;
  messages: any;
  statusCheck: string;
  serverMessage:any;
  languageCode:any;

  id = '';
  error = false;
  errorMessage = '';
  constructor(
    private translate: TranslateService,
    private appService: AppConfigService,
    private auditService: AuditService,
    private dataStorageService: DataStorageService,
    private headerService: HeaderService,
    public dialog: MatDialog
  ) {
    this.languageCode = this.headerService.getUserPreferredLanguage();
    translate.use(this.headerService.getUserPreferredLanguage());
    this.translate
    .getTranslation(this.headerService.getUserPreferredLanguage())
    .subscribe(response => {
      console.log(response);
      this.messages = response['packet-status'];
      this.serverMessage = response['serverError'];
    });
  }

  ngOnInit() {
    this.auditService.audit(5, 'ADM-045');
  }

  search() {
    this.data = null;
    this.errorMessage = '';

    console.log('========== PACKET STATUS SEARCH START ==========');
    console.log('Registration ID:', this.id);

    if (this.id.length == 0) {

      this.error = true;

      console.log('ERROR: Registration ID is empty');

    } else {

      this.error = false;

      console.log('Calling getPacketStatus API...');

      this.dataStorageService
        .getPacketStatus(
          this.id,
          this.headerService.getUserPreferredLanguage()
        )
        .subscribe(response => {

          console.log('========== PACKET STATUS API RESPONSE ==========');
          console.log('Full API Response:', response);

          if (response['errors']) {

            console.log('API returned errors:', response['errors']);

            this.error = true;
            this.statusCheck = '';
            this.errorMessage =
              this.serverMessage[response['errors'][0].errorCode];

            console.log('Error Message:', this.errorMessage);

          } else {

            this.data =
              response['response']['packetStatusUpdateList'];

            console.log('========== PACKET STATUS LIST ==========');
            console.log('Total Records:', this.data?.length);
            console.log('Full packetStatusUpdateList:', this.data);

            this.error = false;
            this.showDetails = true;

            if (this.data && this.data.length > 0) {

              console.log('========== ALL STATUS RECORDS ==========');

              this.data.forEach((item, index) => {

                console.log(
                  'INDEX:',
                  index,
                  '| STATUS:',
                  item.statusCode,
                  '| SUB STATUS:',
                  item.subStatusCode,
                  '| TRANSACTION:',
                  item.transactionTypeCode,
                  '| DATE:',
                  item.createdDateTimes
                );

              });

              console.log('========== FIRST RECORD ==========');
              console.log('First Record:', this.data[0]);

              console.log('========== LAST RECORD ==========');
              console.log(
                'Last Record:',
                this.data[this.data.length - 1]
              );

              const latestStatus =
                this.data[this.data.length - 1].statusCode;

              console.log('========== LATEST STATUS ==========');
              console.log('Latest Status:', latestStatus);

              if (latestStatus.includes('FAILED')) {

                this.statusCheck =
                  this.messages.statuscheckFailed;

                console.log(
                  'FINAL STATUS CHECK: FAILED'
                );

              } else {

                this.statusCheck =
                  this.messages.statuscheckCompleted;

                console.log(
                  'FINAL STATUS CHECK: COMPLETED'
                );
              }

              console.log(
                'StatusCheck displayed in UI:',
                this.statusCheck
              );

            } else {

              console.log(
                'WARNING: packetStatusUpdateList is empty'
              );

            }

            console.log('========== PACKET STATUS SEARCH END ==========');
          }
        });
    }
  }

viewMore() {
    this.showTimeline = !this.showTimeline;
  }
}
