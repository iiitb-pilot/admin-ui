import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import { RequestModel } from "src/app/core/models/request.model";
import { FilterRequest } from "src/app/core/models/filter-request.model";
import { FilterValuesModel } from "src/app/core/models/filter-values.model";
import { OptionalFilterValuesModel } from "src/app/core/models/optional-filter-values.model";
import { SortModel } from "src/app/core/models/sort.model";
import { DataStorageService } from "src/app/core/services/data-storage.service";
import { AppConfigService } from "src/app/app-config.service";
import { PaginationModel } from "src/app/core/models/pagination.model";
import { CenterRequest } from "src/app/core/models/centerRequest.model";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import Utils from "src/app/app.utils";
import {
  MatDialog,
  MatPaginator,
  MatTableDataSource,
  PageEvent,
} from "@angular/material";
import { TranslateService } from "@ngx-translate/core";
import { DialogComponent } from "src/app/shared/dialog/dialog.component";
import { AuditService } from "src/app/core/services/audit.service";
import { HeaderService } from "src/app/core/services/header.service";
import { ProfileDialogComponent } from "../lost-rid-profile/profile-dialog/profile-dialog.component";
import { log } from "util";
import { ConfirmDialogComponent } from "../lost-rid-profile/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-lost-rid-status",
  templateUrl: "./lost-rid-status.component.html",
  styleUrls: ["./lost-rid-status.component.scss"],
})
export class LostRidStatusComponent implements OnInit {
  displayedColumns = [];
  filterColumns = [];
  actionButtons = [];
  actionEllipsis = [];
  paginatorOptions: any;
  sortFilter = [];
  primaryLang: string;
  pagination = new PaginationModel();
  centerRequest = {} as CenterRequest;
  requestModel: RequestModel;
  filtersRequest: FilterRequest;
  filterModel: FilterValuesModel;
  datas = [];
  subscribed: any;
  errorMessages: any;
  noData = false;
  filtersApplied = false;
  popupMessages: any;
  serverError: any;
  filterOptions: any = {};
  fieldNameList: any = {};
  showTable = false;
  dataSource = [];
  initialLocationCode: "";
  locationFieldNameList: string[] = [];
  dynamicDropDown = {};
  dynamicFieldValue = {};
  locCode = 0;
  displayedColumns1: string[] = ["id", "registrationDate", "action"];
  isTableMain = true;
  lostRidRoles = [];
  actionButton = true;

  pageSize = 10;
  pageIndex = 0;
  totalRecords = 0;
  paginatedData = [];


  constructor(
    private dataStroageService: DataStorageService,
    private appService: AppConfigService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private headerService: HeaderService,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private auditService: AuditService
  ) {
    this.getlostridConfigs();
    this.primaryLang = this.headerService.getUserPreferredLanguage();

    this.translateService.use(this.primaryLang);
    translateService.getTranslation(this.primaryLang).subscribe((response) => {
      this.errorMessages = response.errorPopup;
    });
    this.subscribed = router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.displayedColumns) this.getlostridConfigs();
      }
    });
  }

  ngOnInit() {
    this.auditService.audit(5, "ADM-045");
    this.initialLocationCode = this.appService.getConfig()["countryCode"];
    this.locCode = this.appService.getConfig()["locationHierarchyLevel"];
    //this.getLocationHierarchyLevels();
    this.getlocationDetails();
    this.translateService
      .getTranslation(this.primaryLang)
      .subscribe((response) => {
        this.popupMessages = response;
        this.serverError = response.serverError;
      });
  }

  getlostridConfigs() {
    this.dataStroageService
      .getSpecFileForMasterDataEntity("lost-rid-status")
      .subscribe((response) => {
        this.displayedColumns = response.columnsToDisplay;
        this.filterColumns = response.filterColumns;

        this.actionButtons = response.actionButtons.filter(
          (value) => value.showIn.toLowerCase() === "ellipsis"
        );
        this.actionEllipsis = response.actionButtons.filter(
          (value) => value.showIn.toLowerCase() === "button"
        );
        for (let value of this.filterColumns) {
          this.fieldNameList[value.filtername] = "";
        }
        this.paginatorOptions = response.paginator;

        this.auditService.audit(
          3,
          response.auditEventIds[0],
          "lost-rid-status"
        );
        this.getlostridDetails();
      });
  }

  getLocationHierarchyLevels() {
    let self = this;
    let fieldNameData = {};
    this.dataStroageService
      .getLocationHierarchyLevels(this.primaryLang)
      .subscribe((response) => {
        response.response.locationHierarchyLevels.forEach(function (value) {
          if (value.hierarchyLevel != 0)
            if (value.hierarchyLevel <= self.locCode)
              self.locationFieldNameList.push(value.hierarchyLevelName);
        });
        for (let value of this.locationFieldNameList) {
          self.dynamicDropDown[value] = [];
          self.dynamicFieldValue[value] = "";
        }
        self.loadLocationDataDynamically("", 0);
      });
  }

  loadLocationDataDynamically(event: any, index: any) {
    let locationCode = "";
    let fieldName = "";
    let self = this;
    if (event === "") {
      fieldName = this.locationFieldNameList[parseInt(index)];
      locationCode = this.initialLocationCode;
    } else {
      fieldName = this.locationFieldNameList[parseInt(index) + 1];
      locationCode = event.value;
      this.dynamicFieldValue[this.locationFieldNameList[parseInt(index)]] =
        event.value;
      if (parseInt(index) + 1 === this.locationFieldNameList.length) {
        this.getCenterDetails(event.value);
      } else {
        this.dynamicDropDown["centerId"] = "";
      }
    }
    this.dataStroageService
      .getImmediateChildren(locationCode, this.primaryLang)
      .subscribe((response) => {
        if (response["response"])
          self.dynamicDropDown[fieldName] = response["response"]["locations"];
      });
  }

  getlocationDetails() {
    const filterObject = new FilterValuesModel("code", "unique", "");
    let optinalFilterObject = [
      {
        columnName: "hierarchyLevel",
        type: "equals",
        value: this.locCode.toString(),
      },
    ];
    let filterRequest = new FilterRequest(
      [filterObject],
      this.primaryLang,
      optinalFilterObject
    );
    let request = new RequestModel("", null, filterRequest);
    this.dataStroageService
      .getFiltersForAllMaterDataTypes("locations", request)
      .subscribe((response) => {
        if (!response.errors) {
          this.dynamicDropDown["locationCode"] = response.response.filters;
        } else {
          this.dynamicDropDown["locationCode"] = [];
        }
      });
  }

  getCenterDetails(locCode) {
    const filterObject = new FilterValuesModel("name", "unique", "");
    let optinalFilterObject = [
      { columnName: "locationCode", type: "equals", value: locCode },
    ];
    let filterRequest = new FilterRequest(
      [filterObject],
      this.primaryLang,
      optinalFilterObject
    );
    let request = new RequestModel("", null, filterRequest);
    this.dataStroageService
      .getFiltersForAllMaterDataTypes("registrationcenters", request)
      .subscribe((response) => {
        if (!response.errors) {
          this.dynamicDropDown["centerId"] = response.response.filters;
        } else {
          this.dynamicDropDown["centerId"] = [];
        }
      });
  }

  captureValue(event: any, formControlName: string) {
    this.fieldNameList[formControlName] = event.target.value;
  }

  captureDatePickerValue(event: any, formControlName: string) {
    let dateFormat = new Date(event.target.value);
    let formattedDate =
      dateFormat.getFullYear() +
      "-" +
      ("0" + (dateFormat.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + dateFormat.getDate()).slice(-2);
    this.fieldNameList[formControlName] = formattedDate;
  }

  captureDropDownValue(event: any, formControlName: string) {
    if (event.source.selected) {
      if (formControlName === "locationCode") {
        this.fieldNameList[formControlName] = event.source.value;
        this.dynamicDropDown["centerId"] = [];
        this.getCenterDetails(event.source.viewValue);
      } else {
        this.fieldNameList[formControlName] = event.source.value;
      }
    }
  }

  resetForm() {
    let self = this;

    for (let property in self.fieldNameList) {
      self.fieldNameList[property] = "";
    }
  }

  submit() {
    let count = 0;
    this.lostRidRoles = this.headerService.getRoles().split(',')
    for (let i = 0; i < this.lostRidRoles.length; i++) {
      if (this.lostRidRoles[i].trim() == 'BIOMETRIC READ' || this.lostRidRoles[i].trim() == 'DATA READ') {
        count++
      } if (count == 2) {
        break;
      }
    }
    if (count == 2) {
      this.actionButton = false;
    }
    let self = this;
    let mandatoryFieldName = [];
    let mandatoryFieldLabel = [];
    for (let i = 0; i < self.filterColumns.length; i++) {
      if (self.filterColumns[i].ismandatory === "true") {
        mandatoryFieldName.push(self.filterColumns[i].filtername);
        mandatoryFieldLabel.push(
          self.filterColumns[i].filterlabel[this.primaryLang]
        );
      }
    }

    let len = mandatoryFieldName.length;
    for (let i = 0; i < len; i++) {
      if (!self.fieldNameList[mandatoryFieldName[i]]) {
        this.showErrorPopup(
          mandatoryFieldLabel[i] +
          this.popupMessages.genericerror.fieldNameValidation
        );
        break;
      } else if (len === i + 1) {
        self.getlostridDetails();
      }
    }
  }

  getlostridDetails() {
    let filter = [];
    let name1: string = "";
    for (let value of this.filterColumns) {


      let count: number = 0;
      if (this.fieldNameList[value.filtername]) {
        if (value.dropdown !== "true" && value.datePicker !== "true") {
          if (
            value.fieldName !== "phone" ||
            value.fieldName !== "email"
          ) {
            if (count === 0) {
              name1 += this.fieldNameList[value.filtername];
              count++;
            } else if (count === 1) {
              name1 += " " + this.fieldNameList[value.filtername];
            }
            continue;
          }
          filter.push({
            columnName: value.fieldName,
            type: "contains",
            value: this.fieldNameList[value.filtername],
          });
        } else if (
          value.datePicker === "true" &&
          value.filterType === "between"
        ) {
          if (filter.length > 0) filter.splice(0, 1);
          filter.push({
            columnName: value.fieldName,
            type: "between",
            value: "",
            fromValue: this.fieldNameList["registrationDateFrom"],
            toValue: this.fieldNameList["registrationDateTo"],
          });
        } else if (value.dropdown === "true") {
          filter.push({
            columnName: value.fieldName,
            type: "equals",
            value: this.fieldNameList[value.filtername],
          });
        }
      }
    }
    if (name1) {
      filter.push({ columnName: "name", type: "contains", value: name1 });
    }

    this.datas = [];
    this.dataSource = [];
    this.noData = false;
    this.filtersApplied = false;
    const filters = Utils.convertFilter(
      this.activatedRoute.snapshot.queryParams,
      this.primaryLang
    );
    filters.filters = filter;
    if (filters.filters.length > 0) {
      this.filtersApplied = true;
    }
    this.sortFilter = filters.sort;

    if (this.sortFilter.length == 0) {
      this.sortFilter.push({
        sortType: "desc",
        sortField: "registrationDate"
      });
    }

    filters.pagination = {
      pageStart: this.pageIndex,
      pageFetch: this.pageSize
    };

    this.requestModel = new RequestModel(
      null,
      null,
      filters
    );
    if (filters.filters.length > 0)
      this.dataStroageService
        .getlostridDetails(this.requestModel)
        .subscribe(({ response, errors }) => {
          if (errors.length === 0) {
            this.paginatorOptions.totalEntries = 0;
            this.paginatorOptions.pageIndex = 0;
            this.paginatorOptions.pageSize = 0;
            if (response.data.length) {
              this.totalRecords = response.totalRecord;
              this.paginatedData = response.data.map((element) => ({
                ...element,
                registrationDate: element.registartionDate,
                name: element.additionalInfo && element.additionalInfo.name ? element.additionalInfo.name : '',
              }));
              this.showTable = true;
            } else {
              this.noData = true;
            }
          } else {
            this.noData = true;
            let message = "";
            if (errors[0].errorCode === "KER-MSD-999") {
              errors.forEach((element) => {
                message = message + element.message.toString() + "\n\n";
              });
              message =
                this.serverError[errors[0].errorCode] + "\n\n" + message;
            } else {
              message = this.serverError[errors[0].errorCode];
            }
            this.dataSource = [];

            this.showErrorPopup(message);
          }
        });
    else this.noData = true;
  }
  showErrorPopup(message: string) {
    this.dialog.open(ConfirmDialogComponent, {
      width: "650px",
      data: {
        case: "MESSAGE",
        title: this.popupMessages.genericmessage.errorLabel,
        message: message,
        btnTxt: this.popupMessages.genericmessage.successButton,
      },
      disableClose: true,
    });
  }

  fetchLostRidDetails(
    element: { registrationId: string },
    index: number
  ): void {
    this.dataStroageService
      .getLostRidDetailsPhoto(element.registrationId)
      .subscribe(
        (response: any) => {
          const lostData = response.response.lostRidDataMap;
          this.openDialog(lostData, this.paginatedData, index);
        },
        (error: any) => {
          console.error("Error fetching details", error);
        }
      );
  }
  openDialog(data: any, dataSource: any, i: number): void {
    const dialogRef = this.dialog.open(ProfileDialogComponent, {
      data: { lostData: data, dataSource: dataSource, i: i },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Handle dialog close action here
    });
  }

  handlePageEvent(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.getlostridDetails();
  }

  ngOnDestroy() {
    this.subscribed.unsubscribe();
  }
}
