import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pick } from './models/pick';
import { ChosenTeam } from './models/chosen-team';
import { TeamsService } from './teams.service';
import { Team } from './models/team';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { datepickerAnimation } from 'ngx-bootstrap/datepicker/datepicker-animations';
import { Router } from '@angular/router';

@Injectable()
export class PickService {
  pick:Pick;
  api:string;
  pickedTeams:ChosenTeam[] = [];
  pickName:string = '';
  pickBy:string = '';
  pickId:string = '';

  constructor(private http:HttpClient, private router:Router ,private teamService: TeamsService, @Inject('dbUrl')api:string) {
    this.api = api+'/picks';
   }

   postPick(pic:Pick):string{
     this.http.post<Pick>(this.api, pic).subscribe(data=>{
       this.pickId = data.id;
       console.log(data.id);
     });
     console.log(this.pickId);
     return this.pickId;
    }

    getPick(id:string){
      this.http.get<Pick>(this.api+'/'+id).subscribe(p=>{
        console.log(p);
        this.pickToChose(p); 
        this.pickBy = p.userName;
        this.pickName = p.name;
      }, err=> this.errorHandel(err,id));

    }

    pickToChose(p:Pick){
      for(let i:number = 0; i<14; i++){
        let pl:string = "p"+(i+1);
        if(p[pl] > 0){
          let team:Team = this.teamService.teams.find(t=> t.id == p[pl]);
          this.pickedTeams[i] = {
            id: team.id,
            teamName: team.teamName,
            pColor: team.pColor,
            sColor: team.sColor,
            chosenP: i+1
          };
          }else{
            this.pickedTeams[i] = null;
          }
      }
    }

    errorHandel(err:any, id:string){
      if(err.status == 404){
        this.router.navigate([`/notFoundTB`]);
      }else if(err.status == 400){
        let errors = [];
        for (let key in err.error.modelState) {
          for (var i = 0; i < err.error.modelState[key].length; i++) {
            errors.push(err.error.modelState[key][i]);
          }
        }
        let str:string = 'Errors:';
        errors.forEach(c=> str+= ('\n*'+c));
        str += '\nPlease chack the form and resend it';
        alert(str);
      };
    }
  }
