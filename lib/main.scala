/**
  * Created by sunji on 17/7/29.
  */
import breeze.io.CSVReader
import org.apache.spark.sql.SQLContext
import org.apache.spark.{SparkConf, SparkContext}
import org.apache.log4j.{Level, Logger}

import scala.io.Source

object main {
  case class Rule(field0: String, field1: String, simFunc: String, simThreshold: Float)
//  case class Field(name: String, `type`: scala.type)
  Logger.getLogger("org").setLevel(Level.ERROR)
  var ruleSet: Array[Rule] = null
  var sqlSet: Array[String] = null

//  var relationSchema: Array[Field] = null

  var dataFileLeft: String = ""
  var dataFileRight: String = ""

  var leftTableName: String = "table1"
  var rightTableName: String = "table2"
  var select = "0"

  var sparkContext: SparkContext = null
  var sqlContext: SQLContext = null

  def parseRule(file: String): Unit = {
//    println("read rule file")
    ruleSet = {
      for (line <- Source.fromFile(file).getLines) yield {
        val l = line.split(",")
        Rule(l(1), l(2), l(3), l(4).toFloat)
      }
    }.toArray
  }

  def parseSql(file: String): Unit = {
    var input = new java.io.FileReader(file)
    sqlSet = {
      for (sql <- CSVReader.read(input)) yield {
        leftTableName = sql(1)
        rightTableName = sql(2)
        sql(3)
      }
    }.toArray
  }

  def main(args:Array[String]): Unit = {

    try {
      select = args(0)
      dataFileLeft = args(1)
      dataFileRight = args(2)
      val configure = args(3)
      if (select == "0") {
        parseRule(configure)
      } else {
        parseSql(configure)
      }
    } catch {
      case _ => throw new IllegalArgumentException("Argument Error!")
    }

    try {
      val sparkConf = new SparkConf()
        .setAppName("EntityMatching")
        .setMaster("local")
        .set("spark.sql.joins.partitionNumToBeSent", "0")
      sparkContext = new SparkContext(sparkConf)
      sqlContext = new SQLContext(sparkContext)
    } catch {
      case _ => throw new RuntimeException("Spark Setup Error")
    }

    entityMatching()

  }

  def entityMatching(): Unit = {

    val df1 = sqlContext.read.json(dataFileLeft)
    val df2 = sqlContext.read.json(dataFileRight)

    df1.registerTempTable(leftTableName)
    df2.registerTempTable(rightTableName)

    val fields1 = df1.schema.fields.map(x => x.name)
    val fields2 = df2.schema.fields.map(x => x.name)
//    println(df1.show())
//    println(df2.show())

    val result = {
      if (select == "0") {
        val projList = fields1.union(fields2.map(x => x + "1"))
        var projStat = ""
        for (i <- fields1) {
          projStat = projStat + "table1." + i + ","
        }
        for (i <- fields2) {
          projStat = projStat + "table2." + i + " as " + i + "1,"
        }
        projStat = projStat.substring(0, projStat.length - 1)

        for (rule <- ruleSet) yield {
          val threshold = rule.simThreshold
          val query = {
            if (rule.simFunc == "EDSIMILARITY") {
              s"select distinct " + projStat + s" from table1 SIMILARITY join table2 on ${rule.simFunc}(table1.${rule.field0}, table2.${rule.field1}) <= ${threshold.toInt}"
            } else {
              s"select distinct " + projStat + s" from table1 SIMILARITY join table2 on ${rule.simFunc}(table1.${rule.field0}, table2.${rule.field1}) >= ${threshold}"
            }
          }
          //        println(query)
          sqlContext.sql(query).toJSON.collect
        }
      } else {
        for (sql <- sqlSet) yield {
//          println(sql)
          val df = sqlContext.sql(sql)
          df.toJSON.collect
        }
      }
    }
//    println(result(0).size, result(1).size)
    val rr = result.reduce(_.intersect(_))

//    println(rr.toSet.size)
    rr.foreach(x => {
       println(x)
    })
  }
}
